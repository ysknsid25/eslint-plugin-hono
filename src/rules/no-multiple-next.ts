import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils";

type Options = [];
type MessageIds = "multipleNext";

export const noMultipleNext = createRule<Options, MessageIds>({
    name: "no-multiple-next",
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow multiple calls to next() in a single middleware execution path",
        },
        schema: [],
        messages: {
            multipleNext: "next() should not be called multiple times.",
        },
    },
    defaultOptions: [],
    create(context) {
        let funcInfo: {
            nextParamName: string | null;
            currentSegments: Set<string>; // IDs of segments currently being traversed
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            segmentState: Map<string, { called: boolean; node?: any }>;
        } | null = null;

        const funcStack: (typeof funcInfo)[] = [];

        return {
            onCodePathStart(node) {
                let nextParamName: string | null = null;

                if (
                    node.type === "ArrowFunctionExpression" ||
                    node.type === "FunctionExpression" ||
                    node.type === "FunctionDeclaration"
                ) {
                    if (node.params.length >= 2) {
                        const secondParam = node.params[1];
                        if (secondParam.type === "Identifier") {
                            nextParamName = secondParam.name;
                        }
                    }
                }

                funcInfo = {
                    nextParamName,
                    currentSegments: new Set(),
                    segmentState: new Map(),
                };
                funcStack.push(funcInfo);
            },

            onCodePathEnd() {
                funcStack.pop();
                funcInfo =
                    funcStack.length > 0
                        ? funcStack[funcStack.length - 1]
                        : null;
            },

            onCodePathSegmentStart(segment) {
                if (!funcInfo) return;
                funcInfo.currentSegments.add(segment.id);

                let anyPrevCalled = false;
                for (const prev of segment.prevSegments) {
                    const prevState = funcInfo.segmentState.get(prev.id);
                    if (prevState && prevState.called) {
                        anyPrevCalled = true;
                        break;
                    }
                }

                funcInfo.segmentState.set(segment.id, {
                    called: anyPrevCalled,
                });
            },

            onCodePathSegmentEnd(segment) {
                if (!funcInfo) return;
                funcInfo.currentSegments.delete(segment.id);
            },

            CallExpression(node) {
                if (!funcInfo || !funcInfo.nextParamName) return;

                const callee = node.callee;
                if (
                    callee.type === "Identifier" &&
                    callee.name === funcInfo.nextParamName
                ) {
                    // Check if inside loop
                    let current: TSESTree.Node | undefined = node.parent;
                    while (current) {
                        if (
                            current.type === "WhileStatement" ||
                            current.type === "DoWhileStatement" ||
                            current.type === "ForStatement" ||
                            current.type === "ForInStatement" ||
                            current.type === "ForOfStatement"
                        ) {
                            context.report({
                                node,
                                messageId: "multipleNext",
                            });
                            return; // Report once and exit to avoid duplicate reports from CodePath check
                        }
                        if (
                            current.type === "FunctionExpression" ||
                            current.type === "ArrowFunctionExpression" ||
                            current.type === "FunctionDeclaration"
                        ) {
                            break; // Stop at function boundary
                        }
                        current = current.parent;
                    }

                    // CodePath check
                    for (const segmentId of funcInfo.currentSegments) {
                        const state = funcInfo.segmentState.get(segmentId);
                        if (state) {
                            if (state.called) {
                                context.report({
                                    node,
                                    messageId: "multipleNext",
                                });
                            } else {
                                state.called = true;
                                state.node = node;
                            }
                        }
                    }
                }
            },
        };
    },
});
