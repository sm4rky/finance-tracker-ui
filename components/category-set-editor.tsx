"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeMouseHandler,
  type FinalConnectionState,
  type HandleType,
  type NodeMouseHandler,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

import type {
  ProfileCustomCategoryResponse,
  ProfileCustomCategorySetResponse,
  UpsertProfileCustomCategorySetRequest,
} from "@/interface/profile-custom-category";
import { upsertProfileCustomCategorySet } from "@/lib/api/profile-custom-category";
import { PFC_PRIMARY_METAS } from "@/lib/pfc-primary";
import { DEFAULT_CUSTOM_CATEGORY_COLOR } from "@/lib/custom-category-colors";
import { DEFAULT_CUSTOM_CATEGORY_ICON } from "@/lib/custom-category-icons";

import { CategoryEditorPanel } from "@/components/category-editor-panel";
import {
  CustomCategoryFlowNode,
  type CustomCategoryNode,
} from "@/components/custom-category-flow-node";
import { DeleteCustomCategoryDialog } from "@/components/delete-custom-category-dialog";
import {
  PfcPrimaryFlowNode,
  type PfcPrimaryNode,
} from "@/components/pfc-primary-flow-node";
import { DeleteCategorySetDialog } from "@/components/delete-category-set-dialog";

const PFC_VERSION = "V2";
const PFC_PRIMARY_NODE_ID_PREFIX = "pfc:";
const CUSTOM_CATEGORY_NODE_ID_PREFIX = "category:";
const DRAFT_CUSTOM_CATEGORY_NODE_ID_PREFIX = "draft-category:";

const PFC_X = 0;
const CATEGORY_X = 450;
const PFC_Y_GAP = 80;
const CATEGORY_Y_GAP = 140;

const EDGE_OPTIONS = {
  type: "simplebezier",
  markerEnd: { type: MarkerType.ArrowClosed },
  reconnectable: "target",
  style: { strokeWidth: 3 },
} satisfies Partial<Edge>;

const createPfcPrimaryNodeId = (code: string) =>
  `${PFC_PRIMARY_NODE_ID_PREFIX}${code}`;
const createCustomCategoryNodeId = (id?: string | null) =>
  id
    ? `${CUSTOM_CATEGORY_NODE_ID_PREFIX}${id}`
    : `${DRAFT_CUSTOM_CATEGORY_NODE_ID_PREFIX}${crypto.randomUUID()}`;

const isPfcPrimaryNodeId = (id?: string | null): boolean =>
  id?.startsWith(PFC_PRIMARY_NODE_ID_PREFIX) ?? false;
const isCustomCategoryNodeId = (id?: string | null): boolean =>
  (id?.startsWith(CUSTOM_CATEGORY_NODE_ID_PREFIX) ||
    id?.startsWith(DRAFT_CUSTOM_CATEGORY_NODE_ID_PREFIX)) ??
  false;

const getPfcPrimaryCode = (nodeId: string) =>
  nodeId.slice(PFC_PRIMARY_NODE_ID_PREFIX.length);

function createCustomCategoryPfcPrimaryEdge(
  customCategoryNodeId: string,
  pfcPrimaryNodeId: string,
): Edge {
  return {
    id: `${customCategoryNodeId}->${pfcPrimaryNodeId}`,
    source: customCategoryNodeId,
    target: pfcPrimaryNodeId,
    ...EDGE_OPTIONS,
  };
}

function createPfcPrimaryNodes(): PfcPrimaryNode[] {
  return Object.keys(PFC_PRIMARY_METAS).map((code, index) => ({
    id: createPfcPrimaryNodeId(code),
    type: "pfcPrimary",
    position: { x: PFC_X, y: index * PFC_Y_GAP },
    data: { code },
    draggable: false,
  }));
}

function createCustomCategoryNode(
  category: ProfileCustomCategoryResponse,
  index: number,
  selected = false,
): CustomCategoryNode {
  return {
    id: createCustomCategoryNodeId(category.id),
    type: "customCategory",
    position: { x: CATEGORY_X, y: index * CATEGORY_Y_GAP },
    data: {
      category,
      selected,
      mappedCount: 0,
    },
  };
}

type CategorySetEditorProps = {
  selectedCategorySet: ProfileCustomCategorySetResponse;
  onSaveCategorySet: (categorySet: ProfileCustomCategorySetResponse) => void;
  onDeleteCategorySet: (categorySetId: string) => void;
};

export function CategorySetEditor({
  selectedCategorySet,
  onSaveCategorySet,
  onDeleteCategorySet,
}: CategorySetEditorProps) {
  const queryClient = useQueryClient();

  const initialFlow = useMemo(() => {
    const nodes = selectedCategorySet.categories.map((category, index) =>
      createCustomCategoryNode(category, index, index === 0),
    );

    const edges: Edge[] = selectedCategorySet.categories.flatMap(
      (category, index) =>
        category.pfcPrimaries.map((pfcPrimary) =>
          createCustomCategoryPfcPrimaryEdge(
            nodes[index].id,
            createPfcPrimaryNodeId(pfcPrimary.pfcPrimaryCode),
          ),
        ),
    );

    return {
      nodes: [...createPfcPrimaryNodes(), ...nodes],
      edges,
      selectedNodeId: nodes[0]?.id ?? null,
    };
  }, [selectedCategorySet]);

  const [setName, setSetName] = useState(
    selectedCategorySet.name || "My Categories",
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialFlow.selectedNodeId,
  );
  const [deleteSetDialogOpen, setDeleteSetDialogOpen] = useState(false);
  const [deleteCustomCategoryDialogOpen, setDeleteCustomCategoryDialogOpen] =
    useState(false);
  const [customizeCategoryMode, setCustomizeCategoryMode] = useState<
    "color" | "icon"
  >("color");
  const [categoryEditorSheetOpen, setCategoryEditorSheetOpen] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);

  const reconnectSucceededRef = useRef(false);
  const reconnectingEdgeRef = useRef<Edge | null>(null);

  const mutation = useMutation({
    mutationFn: upsertProfileCustomCategorySet,
    onSuccess: (saved) => {
      toast.success("Categories saved successfully.");
      queryClient.invalidateQueries({
        queryKey: ["profile-custom-category-sets"],
      });
      onSaveCategorySet(saved);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const customCategoryNodes = useMemo(
    () =>
      nodes.filter(
        (node): node is CustomCategoryNode => node.type === "customCategory",
      ),
    [nodes],
  );

  const selectedCustomCategoryNode = useMemo(
    () => customCategoryNodes.find((node) => node.id === selectedNodeId) ?? null,
    [customCategoryNodes, selectedNodeId],
  );

  const connectedPfcPrimaryCodes = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges
      .filter((edge) => edge.source === selectedNodeId)
      .map((edge) => getPfcPrimaryCode(edge.target));
  }, [edges, selectedNodeId]);

  const mappedCountByCustomCategory = useMemo(() => {
    return edges.reduce<Record<string, number>>((acc, edge) => {
      if (
        isCustomCategoryNodeId(edge.source) &&
        isPfcPrimaryNodeId(edge.target)
      ) {
        acc[edge.source] = (acc[edge.source] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [edges]);

  const flowNodes = useMemo(
    () => {
      const selectedCustomCategoryId = customCategoryNodes.some(
        (node) => node.id === selectedNodeId,
      )
        ? selectedNodeId
        : null;

      const pfcPrimaryIdsConnectedToSelected = new Set(
        selectedCustomCategoryId
          ? edges
            .filter((edge) => edge.source === selectedCustomCategoryId)
            .map((edge) => edge.target)
          : [],
      );

      const pfcPrimaryIdsConnectedToOtherCategories = new Set(
        selectedCustomCategoryId
          ? edges
            .filter((edge) => edge.source !== selectedCustomCategoryId)
            .map((edge) => edge.target)
          : [],
      );

      return nodes.map((node) => {
        if (node.type === "customCategory") {
          return {
            ...node,
            data: {
              ...node.data,
              selected: node.id === selectedNodeId,
              mappedCount: mappedCountByCustomCategory[node.id] ?? 0,
              onDeleteCustomCategory: () =>
                setDeleteCustomCategoryDialogOpen(true),
            },
          };
        }

        if (node.type === "pfcPrimary") {
          const selected = pfcPrimaryIdsConnectedToSelected.has(node.id);
          const dimmed =
            !selected && pfcPrimaryIdsConnectedToOtherCategories.has(node.id);

          return {
            ...node,
            data: {
              ...node.data,
              selected,
              dimmed,
            },
          };
        }

        return node;
      });
    },
    [customCategoryNodes, edges, mappedCountByCustomCategory, nodes, selectedNodeId],
  );

  const flowEdges = useMemo(
    () =>
      edges.map((edge) => {
        const connectedToSelected =
          selectedNodeId != null && edge.source === selectedNodeId;
        const isSelected = edge.id === selectedEdgeId;

        return {
          ...edge,
          animated: connectedToSelected && !isSelected,
          style: {
            ...edge.style,
            stroke: isSelected ? "var(--destructive)" : connectedToSelected ? "var(--primary)" : undefined,
            filter: isSelected
              ? `drop-shadow(0 0 5px var(--destructive))`
              : undefined,
            opacity: isSelected ? 1 : connectedToSelected ? 1 : 0.25,
          },
          markerEnd:
            isSelected || connectedToSelected
              ? {
                type: MarkerType.ArrowClosed,
                color: isSelected ? "var(--destructive)" : "var(--primary)",
              }
              : edge.markerEnd,
        };
      }),
    [edges, selectedEdgeId, selectedNodeId],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (
        !isCustomCategoryNodeId(connection.source) ||
        !isPfcPrimaryNodeId(connection.target)
      ) {
        toast.error("Only custom categories can be connected to PFC primaries");
        return;
      }

      const newEdge = createCustomCategoryPfcPrimaryEdge(
        connection.source!,
        connection.target!,
      );

      setEdges((edges) =>
        addEdge(
          newEdge,
          edges.filter((edge) => edge.target !== connection.target),
        ),
      );
      setSelectedNodeId(connection.source!);
      setSelectedEdgeId(null);
    },
    [setEdges],
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge, connection: Connection) => {
      if (
        !isCustomCategoryNodeId(oldEdge.source) ||
        !isPfcPrimaryNodeId(connection.target)
      ) {
        toast.error("Invalid reconnection");
        return;
      }

      reconnectSucceededRef.current = true;

      const newEdge = createCustomCategoryPfcPrimaryEdge(
        oldEdge.source,
        connection.target!,
      );

      setEdges((eds) =>
        addEdge(
          newEdge,
          eds.filter(
            (e) => e.id !== oldEdge.id && e.target !== connection.target,
          ),
        ),
      );
      setSelectedNodeId(oldEdge.source);
      setSelectedEdgeId(null);
    },
    [setEdges],
  );

  const handleReconnectStart = useCallback(
    (_event: ReactMouseEvent, edge: Edge) => {
      reconnectSucceededRef.current = false;
      reconnectingEdgeRef.current = edge;
    },
    [],
  );

  const handleReconnectEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent,
      edge: Edge,
      _handleType: HandleType,
      connectionState: FinalConnectionState,
    ) => {
      if (reconnectSucceededRef.current) {
        reconnectSucceededRef.current = false;
        reconnectingEdgeRef.current = null;
        return;
      }

      if (!connectionState.isValid) {
        const edgeToDelete = reconnectingEdgeRef.current ?? edge;
        setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete.id));
        setSelectedEdgeId(null);
      }

      reconnectingEdgeRef.current = null;
    },
    [setEdges],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, []);

  const openCategoryEditor = useCallback(() => {
    if (isMobile) {
      setCategoryEditorSheetOpen(true);
    }
  }, [isMobile]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === "customCategory") {
        setSelectedNodeId(node.id);
        setSelectedEdgeId(null);
        openCategoryEditor();
      }
    },
    [openCategoryEditor],
  );

  const createNewCustomCategoryNode = () => {
    const newCustomCategory: ProfileCustomCategoryResponse = {
      id: "",
      name: `Category ${customCategoryNodes.length + 1}`,
      colorSet: DEFAULT_CUSTOM_CATEGORY_COLOR,
      iconName: DEFAULT_CUSTOM_CATEGORY_ICON,
      pfcPrimaries: [],
    };

    const newNode = createCustomCategoryNode(
      newCustomCategory,
      customCategoryNodes.length,
      true,
    );

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    openCategoryEditor();
  };

  const updateSelectedCustomCategory = useCallback(
    (patch: Partial<ProfileCustomCategoryResponse>) => {
      if (!selectedNodeId) return;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === selectedNodeId && node.type === "customCategory"
            ? {
              ...node,
              data: {
                ...node.data,
                category: { ...node.data.category, ...patch },
              },
            }
            : node,
        ),
      );
    },
    [selectedNodeId, setNodes],
  );

  const deleteCustomCategory = useCallback(() => {
    if (!selectedNodeId) return;

    const deletedNodeIndex = customCategoryNodes.findIndex(
      (node) => node.id === selectedNodeId,
    );
    const nextSelectedNode =
      customCategoryNodes[deletedNodeIndex + 1] ??
      customCategoryNodes[deletedNodeIndex - 1] ??
      null;

    setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
    setEdges((prev) => prev.filter((edge) => edge.source !== selectedNodeId));
    setSelectedNodeId(nextSelectedNode?.id ?? null);
    setSelectedEdgeId(null);
    setDeleteCustomCategoryDialogOpen(false);
  }, [customCategoryNodes, selectedNodeId, setNodes, setEdges]);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;

    setEdges((prev) => prev.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }, [selectedEdgeId, setEdges]);

  const handleSaveCustomCategorySet = () => {
    const pfcPrimaryCodesByCategory = edges.reduce<Record<string, string[]>>(
      (acc, edge) => {
        if (
          isCustomCategoryNodeId(edge.source) &&
          isPfcPrimaryNodeId(edge.target)
        ) {
          acc[edge.source] ??= [];
          acc[edge.source].push(getPfcPrimaryCode(edge.target));
        }
        return acc;
      },
      {},
    );

    const payload: UpsertProfileCustomCategorySetRequest = {
      id: selectedCategorySet.id || null,
      name: setName.trim() || "My Categories",
      categories: customCategoryNodes.map((node) => {
        const category = node.data.category;
        const pfcPrimaryCodes = pfcPrimaryCodesByCategory[node.id] ?? [];

        return {
          id: category.id || null,
          name: category.name.trim() || "Untitled",
          colorSet: category.colorSet,
          iconName: category.iconName,
          pfcPrimaries: pfcPrimaryCodes.map((code) => ({
            pfcPrimaryCode: code,
            pfcVersion: PFC_VERSION,
          })),
        };
      }),
    };

    mutation.mutate(payload);
  };

  return (
    <>
      <DeleteCategorySetDialog
        open={deleteSetDialogOpen}
        onOpenChange={setDeleteSetDialogOpen}
        categorySetId={selectedCategorySet.id}
        onDeleted={onDeleteCategorySet}
      />

      <DeleteCustomCategoryDialog
        open={deleteCustomCategoryDialogOpen}
        onOpenChange={setDeleteCustomCategoryDialogOpen}
        onDeleted={deleteCustomCategory}
      />

      <div className="flex min-h-0 min-w-0 flex-1 gap-4">
        <Card className="flex min-h-0 flex-1 flex-col p-0">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="space-y-2">
              <Label htmlFor="set-name">Set Name</Label>
              <Input
                id="set-name"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g. My Categories"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={createNewCustomCategoryNode}
                title="Add new custom category"
                variant="outline"
              >
                <Plus className="size-4" /> Add Category
              </Button>

              {selectedCategorySet.id && (
                <Button
                  variant="destructive"
                  title="Delete category set"
                  onClick={() => setDeleteSetDialogOpen(true)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              )}

              <Button
                onClick={handleSaveCustomCategorySet}
                title="Save category set"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative min-h-0 flex-1 p-0">
            {selectedEdgeId ? (
              <Button
                type="button"
                variant="destructive"
                className="absolute top-4 right-4 z-10"
                onClick={deleteSelectedEdge}
              >
                <Trash2 className="size-4" />
                Delete edge
              </Button>
            ) : null}
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={{
                pfcPrimary: PfcPrimaryFlowNode,
                customCategory: CustomCategoryFlowNode,
              }}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onReconnect={handleReconnect}
              onReconnectStart={handleReconnectStart}
              onReconnectEnd={handleReconnectEnd}
              onEdgeClick={handleEdgeClick}
              onPaneClick={handlePaneClick}
              onNodeClick={handleNodeClick}
              isValidConnection={(connection) =>
                isCustomCategoryNodeId(connection.source) &&
                isPfcPrimaryNodeId(connection.target)
              }
              edgesReconnectable
              reconnectRadius={12}
              panOnDrag
              panOnScroll
              zoomOnPinch
              fitView
              fitViewOptions={{ padding: 0.18 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background />
              <Controls position="top-left" />
            </ReactFlow>
          </CardContent>
        </Card>

        {!isMobile ? (
          <CategoryEditorPanel
            categoryNode={selectedCustomCategoryNode}
            connectedPfcCodes={connectedPfcPrimaryCodes}
            customizeMode={customizeCategoryMode}
            onCustomizeModeChange={setCustomizeCategoryMode}
            onCategoryChange={updateSelectedCustomCategory}
            onDeleteCategory={() => setDeleteCustomCategoryDialogOpen(true)}
          />
        ) : null}
      </div>

      {isMobile ? (
        <Sheet
          open={categoryEditorSheetOpen}
          onOpenChange={setCategoryEditorSheetOpen}
        >
          <SheetContent
            side="right"
            className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-full"
          >
            <SheetHeader className="shrink-0 border-b">
              <SheetTitle>Edit category</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CategoryEditorPanel
                categoryNode={selectedCustomCategoryNode}
                connectedPfcCodes={connectedPfcPrimaryCodes}
                customizeMode={customizeCategoryMode}
                onCustomizeModeChange={setCustomizeCategoryMode}
                onCategoryChange={updateSelectedCustomCategory}
                onDeleteCategory={() => setDeleteCustomCategoryDialogOpen(true)}
                isMobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
