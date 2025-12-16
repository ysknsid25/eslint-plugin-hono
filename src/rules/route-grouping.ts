import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils";

type Options = [
    {
        order: string[];
    }
];

const DEFAULT_ORDER = [
    "use",
    "all",
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
    "on",
];

type RouteDefinition = {
    path: string;
    methods: { name: string; node: TSESTree.MemberExpression }[];
    statement: TSESTree.Statement;
};

export const routeGrouping = createRule<Options, "routeGroup" | "methodOrder">({
    name: "route-grouping",
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Enforce grouping and ordering of routes by HTTP method",
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    order: {
                        type: "array",
                        items: { type: "string" },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            routeGroup:
                "Routes for path '{{path}}' should be grouped together.",
            methodOrder:
                "Method '{{method}}' should be before '{{prevMethod}}' for path '{{path}}'.",
        },
    },
    defaultOptions: [
        {
            order: DEFAULT_ORDER,
        },
    ],
    create(context) {
        const order = context.options[0]?.order || DEFAULT_ORDER;
        const sourceCode = context.sourceCode;

        function getMethodChain(
            node: TSESTree.CallExpression
        ): { name: string; node: TSESTree.MemberExpression }[] {
            const methods: { name: string; node: TSESTree.MemberExpression }[] =
                [];
            let current: TSESTree.Expression | TSESTree.Super = node;

            while (current.type === "CallExpression") {
                if (
                    current.callee.type === "MemberExpression" &&
                    current.callee.property.type === "Identifier"
                ) {
                    const methodName = current.callee.property.name;
                    if (order.includes(methodName)) {
                        methods.unshift({
                            name: methodName,
                            node: current.callee,
                        });
                    }
                }
                if (current.callee.type === "MemberExpression") {
                    current = current.callee.object;
                } else {
                    break;
                }
            }
            return methods;
        }

        function getRoutePath(node: TSESTree.CallExpression): string | null {
            const stack: TSESTree.CallExpression[] = [];
            let temp: TSESTree.Expression | TSESTree.Super = node;
            while (temp.type === "CallExpression") {
                stack.push(temp);
                if (temp.callee.type === "MemberExpression") {
                    temp = temp.callee.object;
                } else {
                    break;
                }
            }

            while (stack.length > 0) {
                const call = stack.pop()!;
                if (
                    call.callee.type === "MemberExpression" &&
                    call.callee.property.type === "Identifier" &&
                    order.includes(call.callee.property.name)
                ) {
                    if (call.arguments.length > 0) {
                        return sourceCode.getText(call.arguments[0]);
                    }
                }
            }

            return null;
        }

        function checkBlock(node: TSESTree.BlockStatement | TSESTree.Program) {
            const routes: RouteDefinition[] = [];

            for (const statement of node.body) {
                if (
                    statement.type !== "ExpressionStatement" ||
                    statement.expression.type !== "CallExpression"
                ) {
                    continue;
                }

                const callExpr = statement.expression;
                const methods = getMethodChain(callExpr);
                if (methods.length === 0) {
                    continue;
                }

                const path = getRoutePath(callExpr);
                if (!path) {
                    continue;
                }

                routes.push({
                    path,
                    methods,
                    statement,
                });
            }

            const seenPaths = new Set<string>();
            let lastPath: string | null = null;
            const pathMethods = new Map<
                string,
                { name: string; node: TSESTree.MemberExpression }[]
            >();

            for (const route of routes) {
                if (route.path !== lastPath) {
                    if (seenPaths.has(route.path)) {
                        context.report({
                            node: route.methods[0].node,
                            messageId: "routeGroup",
                            data: {
                                path: route.path,
                            },
                        });
                    }
                    seenPaths.add(route.path);
                    lastPath = route.path;
                }

                if (!pathMethods.has(route.path)) {
                    pathMethods.set(route.path, []);
                }
                pathMethods.get(route.path)!.push(...route.methods);
            }

            for (const [path, methods] of pathMethods.entries()) {
                for (let i = 0; i < methods.length - 1; i++) {
                    const current = methods[i];
                    const next = methods[i + 1];

                    const currentIndex = order.indexOf(current.name);
                    const nextIndex = order.indexOf(next.name);

                    if (currentIndex === -1 || nextIndex === -1) continue;

                    for (let j = i + 1; j < methods.length; j++) {
                        const later = methods[j];
                        const laterIndex = order.indexOf(later.name);

                        if (laterIndex !== -1 && currentIndex > laterIndex) {
                            context.report({
                                node: later.node,
                                messageId: "methodOrder",
                                data: {
                                    method: later.name,
                                    prevMethod: current.name,
                                    path,
                                },
                            });
                        }
                    }
                }
            }
        }

        return {
            Program: checkBlock,
            BlockStatement: checkBlock,
        };
    },
});
