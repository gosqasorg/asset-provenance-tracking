import * as ts from 'typescript';
import * as fs from 'fs';
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
  isArray: boolean;
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
    const program = ts.createProgram([filePath], {
        target: ts.ScriptTarget.ESNext, 
        module: ts.ModuleKind.CommonJS
    });
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
                // construct the full path
                const cleanRoute = routePath.startsWith('/') ? routePath.slice(1) : routePath;
                const fullPath = '/api/' + cleanRoute;

                routes.push({
                  method,
                  path: fullPath,
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
        const { type: returnType, isArray } = this.getReturnType(node);
        
        handlers.set(name, {
          name,
          parameters,
          returnType,
          description: this.extractJSDocDescription(node),
          isArray,
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

  private getReturnType(func: ts.FunctionDeclaration): { type: string, isArray: boolean } {
    // Analyze return statements to infer response type
    const result = { type: 'application/json', isArray: false };
    
    const visit = (node: ts.Node) => {
      if (ts.isReturnStatement(node) && node.expression) {
        if (ts.isObjectLiteralExpression(node.expression)) {

          const jsonBodyProp = node.expression.properties.find(prop => 
            ts.isPropertyAssignment(prop) && 
            ts.isIdentifier(prop.name) && 
            prop.name.text === 'jsonBody'
          ) as ts.PropertyAssignment;
          
          if (jsonBodyProp) {
            result.type = 'application/json';
            
            try {
                const type = this.typeChecker.getTypeAtLocation(jsonBodyProp.initializer);
                if (this.typeChecker.isArrayType(type) || (type.symbol && type.symbol.name === 'Array')) {
                    result.isArray = true;
                }
            } catch (e) {
                console.warn(`Warning: Could not resolve type for jsonBody in ${func.name?.text}`);
            }
            return; 
          }
          
          const hasBody = node.expression.properties.some(prop => 
            ts.isPropertyAssignment(prop) && 
            ts.isIdentifier(prop.name) && 
            prop.name.text === 'body'
          );
          
          if (hasBody) {
            result.type = 'text/plain';
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    if (func.body) {
      visit(func.body);
    }
    
    return result;
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
            content: this.getResponseContent(handler.returnType, handler.isArray, route.handlerName, pathKey)
          },
          '404': {
            description: 'Not Found'
          }
        }
      };
      
      // Extract path parameters from the route path itself
      const pathParams = this.extractPathParameters(route.path);
      const parameters: any[] = [];
      
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
                  properties: this.inferFormDataProperties(route.handlerName, pathKey)
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
          url: "http://localhost:7071",
          description: "Local Development Server"
        }
      ],
      paths
    };
  }
  
  
  private getResponseContent(contentType: string, isArray: boolean = false, handlerName?: string, routePath: string = ''): any {
    const content: any = {};

    if (routePath.includes('/attachment/')) {
      return {
        'application/octet-stream': {
            schema: { type: 'string', format: 'binary' }
        },
        '*/*': {
            schema: { type: 'string', format: 'binary' }
        }
      };
    }
    
    if (contentType === 'application/json') {
      let schema: any = {
        type: isArray ? 'array' : 'object'
      };

      if (handlerName === 'getProvenance' && isArray) {
        schema.items = {
          type: 'object',
          properties: {
            deviceID: { 
              type: 'string', 
              example: "426eceb480b07a16a1c27209183fcd572cc6e038a3ad663949e8794378367592" 
            },
            timestamp: { 
              type: 'number', 
              description: "Epoch timestamp",
              example: 1764750945643 
            },
            attachments: { 
              type: 'array', 
              items: { type: 'string' },
              description: "List of filenames for images or files",
              example: ["bfaa8c93f70dbf50df7ae9c6a6874ad9123725bd3911b310566129574940bc16"]
            },
            
            record: { 
              type: 'object', 
              properties: {
                blobType: { type: 'string', example: "deviceInitializer" },
                deviceName: { type: 'string', example: "test1" },
                description: { type: 'string', example: "tes" },
                
                tags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    example: [] 
                },
                
                children_key: { type: 'string', example: "" }, 
                
                hasParent: { 
                    type: 'boolean', 
                    example: false 
                },
                
                isReportingKey: { 
                    type: 'boolean', 
                    example: false
                }
              }
            }
          }
        };
      }
      else if (handlerName === 'postProvenance') {
        schema = {
          type: 'object',
          properties: {
            record: {
              type: 'string',
              description: 'The ID/Hash of the uploaded record',
              example: "aac1df01fb03206c013fc06c61156796fe49ca9c719230b0e14d59ce54b6e8ed"
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  blob: { type: 'object', example: {} },
                  name: { type: 'string', example: "IMG_5BC92842B87B-1.jpeg" }
                }
              }
            }
          }
        };
      }
      else if (handlerName === 'upgradeProvenance') {
        schema = {
          type: 'object',
          properties: {
            "already-converted": {
              type: 'boolean',
              description: 'Indicates if the legacy provenance records were already converted.',
              example: true
            }
          }
        };
      }

      else if (routePath.includes('/upgrade/')) {
        schema = {
          type: 'object',
          properties: {
            "already-converted": {
              type: 'boolean',
              description: 'Indicates if the legacy provenance records were already converted.',
              example: true
            }
          },
          required: ["already-converted"] 
        };
      }

      else if (handlerName === 'getStatistics') {
        schema.items = {
          type: 'object',
          properties: {
            timestamp: {
              type: 'string', 
              description: 'Timestamp from blob metadata',
              example: "1765060293569"
            },
            deviceID: {
              type: 'string',
              description: 'Device ID Hash',
              example: "40a5b65099eb332bb18e1f135721d17d48cb2b84fe66b72e20460e31df7faf8f"
            }
          }
        };
      }

      else if (handlerName === 'getVersion') {
        schema = {
          type: 'object',
          properties: {
            version: { 
              type: 'string', 
              description: 'Server version number',
              example: "0.0.3" 
            },
            gitCommit: { 
              type: 'string', 
              description: 'Git commit hash of the build',
              example: "4f5491d" 
            },
            buildTime: { 
              type: 'string', 
              description: 'ISO 8601 timestamp of when the server was built',
              example: "2025-05-16T18:43:14.324Z" 
            }
          }
        };
      }

      else if (isArray) {
        schema.items = { type: 'object' };
      }

      content['application/json'] = { schema };

    } else if (contentType === 'text/plain') {
      let schema: any = { type: 'string' };

      if (handlerName === 'getAttachmentName') {
        schema = {
          type: 'string',
          description: "The original filename of the attachment.",
          example: "IMG_5528.PNG"
        };
      }
      else if (handlerName === 'postEmail') {
        schema = { 
          type: 'string', 
          description: "Success confirmation message", 
          example: "Created" 
        };
      }
      else if (handlerName === 'getNewDeviceKey') {
        schema = { 
          type: 'string', 
          description: "A newly generated encoded device key", 
          example: "VecKCTnzJ1iq5xKC6AVS5G" 
        };
      }
      
      content['text/plain'] = { schema };
    }
    
    return content;
  }
  
  private inferFormDataProperties(handlerName: string, routePath: string = ''): any {
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
          description: 'User email address',
          example: 'user@example.ca'
        }
      };
    }

    if (handlerName === 'postProvenance') {
      const recordExample = {
        blobType: "deviceInitializer",
        deviceName: "device_name",
        description: "record description",
        tags: ["is_payload_correct"],
        children_key: "",
        hasParent: false,
        isReportingKey: false
      };
      return {
        'provenanceRecord': {
          type: 'string',
          description: 'Provenance record details (JSON5 string).',
          example: JSON.stringify(recordExample)
        },
        'attachments': {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          description: 'Multiple file attachments'
        }
      };
    }
    
    return commonProperties;
  }
}

// Usage function
export function generateOpenAPI(sourceFilePath: string, outputPath?: string): void {
  try {
    const generator = new AzureFunctionsOpenAPIGenerator(sourceFilePath);
    const spec = generator.generate();
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