import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface RouteInfo {
  method: string;
  path: string;
  handlerName: string;
  functionName: string;
}

interface HandlerInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType: string;
  description?: string;
}

interface ParameterInfo {
  name: string;
  type: string;
  location: 'path' | 'query' | 'body' | 'formData';
}

class AzureFunctionsOpenAPIGenerator {
  private sourceFile: ts.SourceFile;
  private typeChecker: ts.TypeChecker;

  constructor(filePath: string) {
    const program = ts.createProgram([filePath], {});
    this.sourceFile = program.getSourceFile(filePath)!;
    this.typeChecker = program.getTypeChecker();
  }

  generate(): any {
    const routes = this.extractRoutes();
    const handlers = this.extractHandlers();
    
    return this.buildOpenAPISpec(routes, handlers);
  }

  private extractRoutes(): RouteInfo[] {
    const routes: RouteInfo[] = [];
    
    const visit = (node: ts.Node) => {
      // Look for app.get(), app.post(), etc.
      if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (ts.isPropertyAccessExpression(expression) && 
            ts.isIdentifier(expression.expression) &&
            expression.expression.text === 'app') {
          
          const method = expression.name.text.toUpperCase();
          const args = node.arguments;
          
          if (args.length >= 2) {
            const nameArg = args[0];
            const configArg = args[1];
            
            if (ts.isStringLiteral(nameArg) && ts.isObjectLiteralExpression(configArg)) {
              const functionName = nameArg.text;
              let routePath = '';
              let handlerName = '';
              
              configArg.properties.forEach(prop => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                  if (prop.name.text === 'route' && ts.isStringLiteral(prop.initializer)) {
                    routePath = prop.initializer.text;
                  } else if (prop.name.text === 'handler' && ts.isIdentifier(prop.initializer)) {
                    handlerName = prop.initializer.text;
                  }
                }
              });
              
              if (routePath && handlerName) {
                routes.push({
                  method,
                  path: '/' + routePath,
                  handlerName,
                  functionName
                });
              }
            }
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(this.sourceFile);
    return routes;
  }

  private extractHandlers(): Map<string, HandlerInfo> {
    const handlers = new Map<string, HandlerInfo>();
    
    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.text;
        const parameters = this.extractParameters(node);
        const returnType = this.getReturnType(node);
        
        handlers.set(name, {
          name,
          parameters,
          returnType,
          description: this.extractJSDocDescription(node)
        });
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(this.sourceFile);
    return handlers;
  }

  private extractParameters(func: ts.FunctionDeclaration): ParameterInfo[] {
    const parameters: ParameterInfo[] = [];
    const seenParams = new Set<string>(); // Track seen parameter names
    
    // Analyze function body for parameter usage
    const visit = (node: ts.Node) => {
      // Look for request.params.paramName
      if (ts.isPropertyAccessExpression(node)) {
        const expression = node.expression;
        if (ts.isPropertyAccessExpression(expression) &&
            ts.isIdentifier(expression.expression) &&
            expression.expression.text === 'request' &&
            ts.isIdentifier(expression.name) &&
            expression.name.text === 'params' &&
            ts.isIdentifier(node.name)) {
          
          const paramName = node.name.text;
          if (!seenParams.has(paramName)) {
            seenParams.add(paramName);
            parameters.push({
              name: paramName,
              type: 'string',
              location: 'path'
            });
          }
        }
      }
      
      // Look for request.formData()
      if (ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'request' &&
          ts.isIdentifier(node.expression.name) &&
          node.expression.name.text === 'formData') {
        
        if (!seenParams.has('formData')) {
          seenParams.add('formData');
          parameters.push({
            name: 'body',
            type: 'multipart/form-data',
            location: 'formData'
          });
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    if (func.body) {
      visit(func.body);
    }
    
    return parameters;
  }

  private getReturnType(func: ts.FunctionDeclaration): string {
    // Analyze return statements to infer response type
    const returnTypes: string[] = [];
    
    const visit = (node: ts.Node) => {
      if (ts.isReturnStatement(node) && node.expression) {
        if (ts.isObjectLiteralExpression(node.expression)) {
          const hasJsonBody = node.expression.properties.some(prop => 
            ts.isPropertyAssignment(prop) && 
            ts.isIdentifier(prop.name) && 
            prop.name.text === 'jsonBody'
          );
          
          const hasBody = node.expression.properties.some(prop => 
            ts.isPropertyAssignment(prop) && 
            ts.isIdentifier(prop.name) && 
            prop.name.text === 'body'
          );
          
          if (hasJsonBody) {
            returnTypes.push('application/json');
          } else if (hasBody) {
            returnTypes.push('text/plain');
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    if (func.body) {
      visit(func.body);
    }
    
    return returnTypes[0] || 'application/json';
  }

  private extractJSDocDescription(node: ts.Node): string | undefined {
    const sourceFile = node.getSourceFile();
    const fullText = sourceFile.getFullText();
    const nodeStart = node.getFullStart();
    const nodeEnd = node.getStart();
    const leadingTrivia = fullText.substring(nodeStart, nodeEnd);
    
    const jsDocMatch = leadingTrivia.match(/\/\*\*([\s\S]*?)\*\//);
    if (jsDocMatch) {
      return jsDocMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n')
        .trim();
    }
    
    return undefined;
  }

  // Extract path parameters from route path
  private extractPathParameters(path: string): string[] {
    const matches = path.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  private buildOpenAPISpec(routes: RouteInfo[], handlers: Map<string, HandlerInfo>): any {
    const paths: any = {};
    
    routes.forEach(route => {
      const handler = handlers.get(route.handlerName);
      if (!handler) return;
      
      const pathKey = route.path;
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }
      
      const operation: any = {
        summary: handler.description || `${route.method} ${pathKey}`,
        operationId: route.functionName,
        responses: {
          '200': {
            description: 'Success',
            content: this.getResponseContent(handler.returnType)
          },
          '404': {
            description: 'Not Found'
          }
        }
      };
      
      // Extract path parameters from the route path itself
      const pathParams = this.extractPathParameters(route.path);
      const parameters: any[] = [];
      
      // Add all path parameters found in the route
      pathParams.forEach(paramName => {
        parameters.push({
          name: paramName,
          in: 'path',
          required: true,
          schema: { type: 'string' }
        });
      });
      
      if (parameters.length > 0) {
        operation.parameters = parameters;
      }
      
      // Add request body for POST methods
      if (route.method === 'POST') {
        const formDataParam = handler.parameters.find(p => p.location === 'formData');
        if (formDataParam) {
          operation.requestBody = {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: this.inferFormDataProperties(route.handlerName)
                }
              }
            }
          };
        }
      }
      
      paths[pathKey][route.method.toLowerCase()] = operation;
    });
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Azure Functions API',
        version: '1.0.0',
        description: 'Auto-generated OpenAPI specification'
      },
      servers: [
        {
          url: 'http://localhost:7071/api',
          description: 'Local development server'
        },
        {
          url: 'https://gosqasbe.azurewebsites.net/api',
          description: 'Staging server'
        },
        {
          url: process.env.BACKEND_URL || 'https://gdtprodbackend.azurewebsites.net/api',
          description: 'Production server'
        }
      ],
      paths
    };
  }
  
  
  private getResponseContent(contentType: string): any {
    const content: any = {};
    
    if (contentType === 'application/json') {
      content['application/json'] = {
        schema: {
          type: 'object'
        }
      };
    } else if (contentType === 'text/plain') {
      content['text/plain'] = {
        schema: {
          type: 'string'
        }
      };
    }
    
    return content;
  }
  
  private inferFormDataProperties(handlerName: string): any {
    // Basic form data inference - could be enhanced by analyzing the handler body
    const commonProperties: any = {
      'provenanceRecord': {
        type: 'string',
        description: 'JSON string containing provenance record'
      }
    };
    
    if (handlerName === 'postEmail') {
      return {
        'email': {
          type: 'string',
          format: 'email',
          description: 'User email address'
        }
      };
    }
    
    return commonProperties;
  }
}

// This function is used to merge the auto-generated spec with the manual overrides
function mergeWithManualOverrides(autoSpec: any, manualSpec: any): any {
  const merged = { ...autoSpec };
  
  if (manualSpec.paths) {
    // Collect operationIds from manual overrides to identify which auto paths to remove
    const manualOperationIds = new Set<string>();
    Object.values(manualSpec.paths).forEach((pathOps: any) => {
      Object.values(pathOps).forEach((op: any) => {
        if (op.operationId) {
          manualOperationIds.add(op.operationId);
        }
      });
    });
    
    // Remove auto-generated paths that have the same operationIds as a manual override
    const filteredAutoPaths: any = {};
    Object.entries(autoSpec.paths || {}).forEach(([path, pathOps]: [string, any]) => {
      const filteredOps: any = {};
      Object.entries(pathOps).forEach(([method, op]: [string, any]) => {
        if (!op.operationId || !manualOperationIds.has(op.operationId)) {
          filteredOps[method] = op;
        }
      });
      if (Object.keys(filteredOps).length > 0) {
        filteredAutoPaths[path] = filteredOps;
      }
    });
    
    // Merge filtered auto paths and manual paths, manual takes precedence
    merged.paths = {
      ...filteredAutoPaths,
      ...manualSpec.paths
    };
  }
  return merged;
}

// Usage function
export function generateOpenAPI(sourceFilePath: string, outputPath?: string): void {
  try {
    const generator = new AzureFunctionsOpenAPIGenerator(sourceFilePath);
    let spec = generator.generate();
    
    // Check for manual overrides file
    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      const manualOverridesPath = path.join(outputDir, 'manual-openapi-overrides.yaml');
      
      if (fs.existsSync(manualOverridesPath)) {
        try {
          const manualContent = fs.readFileSync(manualOverridesPath, 'utf8');
          const manualSpec = yaml.load(manualContent) as any;
          spec = mergeWithManualOverrides(spec, manualSpec);
          console.log(`Merged manual overrides from: ${manualOverridesPath}`);
        } catch (error) {
          console.warn(`Warning: Could not load manual overrides file: ${error}`);
        }
      }
    }
    
    const yamlOutput = yaml.dump(spec, { indent: 2 });
    
    if (outputPath) {
      fs.writeFileSync(outputPath, yamlOutput, 'utf8');
      console.log(`OpenAPI spec generated: ${outputPath}`);
    } else {
      console.log(yamlOutput);
    }
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: ts-node openapi-generator.ts <source-file> [output-file]');
    process.exit(1);
  }
  
  generateOpenAPI(args[0], args[1]);
}