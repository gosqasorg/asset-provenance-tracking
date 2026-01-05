"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenAPI = generateOpenAPI;
const ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
class AzureFunctionsOpenAPIGenerator {
    constructor(filePath) {
        const program = ts.createProgram([filePath], {});
        this.sourceFile = program.getSourceFile(filePath);
        this.typeChecker = program.getTypeChecker();
    }
    generate() {
        const routes = this.extractRoutes();
        const handlers = this.extractHandlers();
        return this.buildOpenAPISpec(routes, handlers);
    }
    extractRoutes() {
        const routes = [];
        const visit = (node) => {
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
                                    }
                                    else if (prop.name.text === 'handler' && ts.isIdentifier(prop.initializer)) {
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
    extractHandlers() {
        const handlers = new Map();
        const visit = (node) => {
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
    extractParameters(func) {
        const parameters = [];
        const seenParams = new Set(); // Track seen parameter names
        // Analyze function body for parameter usage
        const visit = (node) => {
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
    getReturnType(func) {
        // Analyze return statements to infer response type
        const returnTypes = [];
        const visit = (node) => {
            if (ts.isReturnStatement(node) && node.expression) {
                if (ts.isObjectLiteralExpression(node.expression)) {
                    const hasJsonBody = node.expression.properties.some(prop => ts.isPropertyAssignment(prop) &&
                        ts.isIdentifier(prop.name) &&
                        prop.name.text === 'jsonBody');
                    const hasBody = node.expression.properties.some(prop => ts.isPropertyAssignment(prop) &&
                        ts.isIdentifier(prop.name) &&
                        prop.name.text === 'body');
                    if (hasJsonBody) {
                        returnTypes.push('application/json');
                    }
                    else if (hasBody) {
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
    extractJSDocDescription(node) {
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
    extractPathParameters(path) {
        const matches = path.match(/\{([^}]+)\}/g);
        return matches ? matches.map(match => match.slice(1, -1)) : [];
    }
    buildOpenAPISpec(routes, handlers) {
        const paths = {};
        routes.forEach(route => {
            const handler = handlers.get(route.handlerName);
            if (!handler)
                return;
            const pathKey = route.path;
            if (!paths[pathKey]) {
                paths[pathKey] = {};
            }
            const operation = {
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
            const parameters = [];
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
    getResponseContent(contentType) {
        const content = {};
        if (contentType === 'application/json') {
            content['application/json'] = {
                schema: {
                    type: 'object'
                }
            };
        }
        else if (contentType === 'text/plain') {
            content['text/plain'] = {
                schema: {
                    type: 'string'
                }
            };
        }
        return content;
    }
    inferFormDataProperties(handlerName) {
        // Basic form data inference - could be enhanced by analyzing the handler body
        const commonProperties = {
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
// Usage function
function generateOpenAPI(sourceFilePath, outputPath) {
    try {
        const generator = new AzureFunctionsOpenAPIGenerator(sourceFilePath);
        const spec = generator.generate();
        const yamlOutput = yaml.dump(spec, { indent: 2 });
        if (outputPath) {
            fs.writeFileSync(outputPath, yamlOutput, 'utf8');
            console.log(`OpenAPI spec generated: ${outputPath}`);
        }
        else {
            console.log(yamlOutput);
        }
    }
    catch (error) {
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
//# sourceMappingURL=translateAzureToSwagger.js.map