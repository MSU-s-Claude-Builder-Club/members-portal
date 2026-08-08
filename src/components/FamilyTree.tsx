import React, {
    useRef,
    useEffect,
    useCallback,
    useMemo,
    useLayoutEffect,
    createContext,
    useContext,
} from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { GitBranch, ZoomIn, ZoomOut } from 'lucide-react';
import type { Family, FamilyNode, MemberWithRole } from '@/types/modal.types';

// ─────────────────────────────────────────────────────────────────────────────
// CSS (injected once)
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
    /* Search #1 result: hard primary outline — no glow, no blur */
    .ft-search-top-node {
      outline: 2px solid hsl(var(--primary));
      outline-offset: 3px;
    }
    .ft-canvas-bg {
      /* Node sizes by depth: base = level 1 (kept as-is); root = base + step; each level steps down by --ft-node-step */
      --ft-node-base: 30px;
      --ft-node-step: 14px;
      --ft-font-base: 0.625rem;
      --ft-font-step: 0.0625rem;
    }
    @media (min-width: 1200px) {
      .ft-canvas-bg { --ft-node-base: 36px; --ft-node-step: 16px; --ft-font-base: 0.6875rem; --ft-font-step: 0.075rem; }
    }
    @media (min-width: 1280px) {
      .ft-canvas-bg { --ft-node-base: 44px; --ft-node-step: 20px; --ft-font-base: 0.8125rem; --ft-font-step: 0.1rem; }
    }
    @media (min-width: 1536px) {
      .ft-canvas-bg { --ft-node-base: 52px; --ft-node-step: 24px; --ft-font-base: 0.9375rem; --ft-font-step: 0.125rem; }
    }
`;

let stylesInjected = false;
function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const el = document.createElement('style');
    el.textContent = STYLES;
    document.head.appendChild(el);
}

// Context for passing refs from FamilyTree into Canvas (for pan/zoom and CSS var)
interface FamilyTreeControlsContextValue {
    containerRef: React.RefObject<HTMLDivElement | null>;
    targetZoomRef: React.MutableRefObject<number>;
    zoomFactorRef: React.MutableRefObject<number>;
    dragDeltaRef: React.MutableRefObject<{ x: number; y: number }>;
}
const FamilyTreeControlsContext = createContext<FamilyTreeControlsContextValue | null>(null);
function useFamilyTreeControls() {
    return useContext(FamilyTreeControlsContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Radial tree layout — no line crossings
// ─────────────────────────────────────────────────────────────────────────────

const RADIUS_PER_DEPTH = 9;

interface NodePosition { x: number; y: number; }

function subtreeLeafCount(node: FamilyNode): number {
    return node.littles.length === 0
        ? 1
        : node.littles.reduce((s, l) => s + subtreeLeafCount(l), 0);
}

function assignRadialPositions(
    node: FamilyNode,
    depth: number,
    startAngle: number,
    endAngle: number,
    out: Map<string, NodePosition>,
): void {
    if (depth === 0) {
        out.set(node.member.id, { x: 0, y: 0 });
    } else {
        const mid = (startAngle + endAngle) / 2;
        const r = depth * RADIUS_PER_DEPTH;
        out.set(node.member.id, { x: r * Math.cos(mid), y: r * Math.sin(mid) });
    }
    if (!node.littles.length) return;
    const totalLeaves = node.littles.reduce((s, l) => s + subtreeLeafCount(l), 0);
    let cursor = startAngle;
    for (const little of node.littles) {
        const arc = (subtreeLeafCount(little) / totalLeaves) * (endAngle - startAngle);
        assignRadialPositions(little, depth + 1, cursor, cursor + arc, out);
        cursor += arc;
    }
}

function collectNodes(node: FamilyNode, acc: FamilyNode[] = []): FamilyNode[] {
    acc.push(node);
    node.littles.forEach(l => collectNodes(l, acc));
    return acc;
}

function collectEdges(node: FamilyNode, acc: [string, string][] = []): [string, string][] {
    for (const little of node.littles) {
        acc.push([node.member.id, little.member.id]);
        collectEdges(little, acc);
    }
    return acc;
}

// ─────────────────────────────────────────────────────────────────────────────
// Three.js scene components (private)
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve the ink hairline token to a concrete color for the WebGL line material (three.js cannot parse CSS vars). */
function getInkLineColor(): string {
    if (typeof window === 'undefined') return 'hsl(0 0% 50%)';
    const channels = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    return channels ? `hsl(${channels})` : 'hsl(0 0% 50%)';
}

function TreeEdge({ from, to, color }: { from: NodePosition; to: NodePosition; color: string }) {
    const points = useMemo(() => [
        new THREE.Vector3(from.x, from.y, 0),
        new THREE.Vector3(to.x, to.y, 0),
    ], [from, to]);
    return <Line points={points} color={color} lineWidth={1} transparent opacity={0.3} />;
}

function TreeNodeCard({
    node,
    position,
    isCurrentUser,
    isHovered,
    isSearchTop,
    onEnter,
    onLeave,
    onNodeClick,
    onNodePointerDown,
}: {
    node: FamilyNode;
    position: NodePosition;
    isCurrentUser: boolean;
    isHovered: boolean;
    isSearchTop?: boolean;
    onEnter: () => void;
    onLeave: () => void;
    onNodeClick: () => void;
    onNodePointerDown?: () => void;
}) {
    const { member } = node;
    const initials = (member.full_name ?? member.email ?? '?')
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const isEBoard = member.role === 'e-board';
    const depth = node.depth;

    /* Monochrome ink chips: 1px hairline; e-board = double-weight ink; current user = the one orange emphasis. */
    const borderClass =
        isCurrentUser
            ? 'border-2 border-primary'
            : isEBoard
                ? 'border-2 border-foreground'
                : isHovered
                    ? 'border border-foreground'
                    : 'border border-border';

    /* Size steps down by level: root = base+step, level 1 = base, level 2 = base-step, etc.; min 18px */
    const sizeStyle = {
        ['--ft-depth' as string]: depth,
        width: 'max(18px, calc((var(--ft-node-base) + var(--ft-node-step) * (1 - var(--ft-depth))) / var(--ft-zoom, 1)))',
        height: 'max(18px, calc((var(--ft-node-base) + var(--ft-node-step) * (1 - var(--ft-depth))) / var(--ft-zoom, 1)))',
        fontSize: 'max(0.5rem, calc((var(--ft-font-base) + var(--ft-font-step) * (1 - var(--ft-depth))) / var(--ft-zoom, 1)))',
    };
    const displayName = member.full_name ?? member.email ?? 'Unknown';

    return (
        <Html position={[position.x, position.y, 0]} center zIndexRange={[10, 0]}>
            <div
                data-family-tree-node
                className={`flex flex-col items-center cursor-pointer select-none transition-transform duration-200 motion-reduce:transition-none ${isHovered ? 'scale-110' : 'scale-100'}`}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onPointerDown={onNodePointerDown}
                onClick={onNodeClick}
                title={displayName}
            >
                <div
                    style={sizeStyle}
                    className={`overflow-hidden flex items-center justify-center font-mono font-semibold box-content transition-colors duration-200 motion-reduce:transition-none ${isHovered ? 'bg-foreground' : 'bg-page'} ${borderClass} ${isSearchTop ? 'ft-search-top-node' : ''}`}
                >
                    {member.profile_picture_url
                        ? <img src={member.profile_picture_url} alt="" className="w-full h-full object-cover" />
                        : <span className={isHovered ? 'text-page' : 'text-muted-foreground'}>{initials}</span>}
                </div>
            </div>
        </Html>
    );
}

const LERP = 0.12;

function AutoCamera({
    positions,
    paddingScale = 1.3,
}: {
    positions: Map<string, NodePosition>;
    paddingScale?: number;
}) {
    const { camera, size } = useThree();
    const controls = useFamilyTreeControls();
    const centerRef = useRef({ x: 0, y: 0 });
    const baseDistRef = useRef(50);
    const targetPanRef = useRef({ x: 0, y: 0 });
    const currentPanRef = useRef({ x: 0, y: 0 });

    useLayoutEffect(() => {
        if (!positions.size) return;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        positions.forEach(p => {
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        });
        centerRef.current = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
        // Tight fit: minimal padding around content bounds (content-based autofit per family)
        const padding = 4;
        const spanX = Math.max(maxX - minX + padding, 4);
        const spanY = Math.max(maxY - minY + padding, 4);
        const aspect = size.width / size.height;
        const fovRad = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
        baseDistRef.current =
            Math.max(
                (spanY / 2) / Math.tan(fovRad / 2),
                (spanX / 2) / (Math.tan(fovRad / 2) * aspect),
            ) * paddingScale;
        targetPanRef.current = { x: 0, y: 0 };
        currentPanRef.current = { x: 0, y: 0 };
    }, [positions, camera, size, paddingScale]);

    useFrame(() => {
        if (!controls) return;
        const { zoomFactorRef, targetZoomRef, dragDeltaRef, containerRef } = controls;
        const { x: cx, y: cy } = centerRef.current;

        // Apply drag delta (pixels) to pan: convert to world units
        const dx = dragDeltaRef.current.x;
        const dy = dragDeltaRef.current.y;
        if (dx !== 0 || dy !== 0) {
            const d = Math.min(baseDistRef.current * zoomFactorRef.current, 200);
            const fovRad = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
            const worldPerPixelY = (2 * d * Math.tan(fovRad / 2)) / size.height;
            const worldPerPixelX = (2 * d * Math.tan(fovRad / 2)) / size.width;
            targetPanRef.current.x -= dx * worldPerPixelX;
            targetPanRef.current.y += dy * worldPerPixelY;
            dragDeltaRef.current.x = 0;
            dragDeltaRef.current.y = 0;
        }

        // Smooth lerp zoom and pan
        zoomFactorRef.current = THREE.MathUtils.lerp(zoomFactorRef.current, targetZoomRef.current, LERP);
        currentPanRef.current.x = THREE.MathUtils.lerp(currentPanRef.current.x, targetPanRef.current.x, LERP);
        currentPanRef.current.y = THREE.MathUtils.lerp(currentPanRef.current.y, targetPanRef.current.y, LERP);

        const dist = Math.min(baseDistRef.current * zoomFactorRef.current, 200);
        const px = cx + currentPanRef.current.x;
        const py = cy + currentPanRef.current.y;
        camera.position.set(px, py, dist);
        camera.lookAt(px, py, 0);

        if (containerRef.current) {
            containerRef.current.style.setProperty('--ft-zoom', String(zoomFactorRef.current));
        }
    });
    return null;
}

function FamilyScene({
    family,
    currentUserId,
    hoveredId,
    searchTopMemberId,
    onHover,
    onNodeClick,
    onNodePointerDown,
}: {
    family: Family;
    currentUserId: string;
    hoveredId: string | null;
    searchTopMemberId: string | null;
    onHover: (id: string | null) => void;
    onNodeClick: (memberId: string) => void;
    onNodePointerDown?: () => void;
}) {
    const positions = useMemo(() => {
        const m = new Map<string, NodePosition>();
        assignRadialPositions(family.tree, 0, 0, 2 * Math.PI, m);
        return m;
    }, [family]);

    const allNodes = useMemo(() => collectNodes(family.tree), [family]);
    const allEdges = useMemo(() => collectEdges(family.tree), [family]);
    const hasChildren = family.tree.littles.length > 0;
    // Tighter autofit: scale so this family's content fills the view (small trees get slightly more padding)
    const paddingScale = hasChildren ? 1.12 : 1.6;
    // Monochrome 1px ink connectors, resolved from the border token
    const edgeColor = getInkLineColor();

    return (
        <>
            <AutoCamera positions={positions} paddingScale={paddingScale} />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 10]} intensity={0.6} color="#ffffff" />
            {allEdges.map(([bigId, littleId]) => {
                const from = positions.get(bigId), to = positions.get(littleId);
                return from && to ? <TreeEdge key={`${bigId}-${littleId}`} from={from} to={to} color={edgeColor} /> : null;
            })}
            {allNodes.map(node => {
                const pos = positions.get(node.member.id);
                return pos ? (
                    <TreeNodeCard
                        key={node.member.id}
                        node={node}
                        position={pos}
                        isCurrentUser={node.member.id === currentUserId}
                        isHovered={hoveredId === node.member.id}
                        isSearchTop={searchTopMemberId === node.member.id}
                        onEnter={() => onHover(node.member.id)}
                        onLeave={() => onHover(null)}
                        onNodeClick={() => onNodeClick(node.member.id)}
                        onNodePointerDown={onNodePointerDown}
                    />
                ) : null;
            })}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Orphans scene: disconnected nodes in a circle (no edges)
// ─────────────────────────────────────────────────────────────────────────────

const ORPHAN_RADIUS = 12;
const ORPHAN_PADDING_SCALE = 1.4;

function OrphanScene({
    orphans,
    currentUserId,
    hoveredId,
    searchTopMemberId,
    onHover,
    onNodeClick,
    onNodePointerDown,
}: {
    orphans: MemberWithRole[];
    currentUserId: string;
    hoveredId: string | null;
    searchTopMemberId: string | null;
    onHover: (id: string | null) => void;
    onNodeClick: (memberId: string) => void;
    onNodePointerDown?: () => void;
}) {
    const positions = useMemo(() => {
        const m = new Map<string, NodePosition>();
        const n = orphans.length;
        orphans.forEach((member, i) => {
            const angle = n > 0 ? (2 * Math.PI * i) / n - Math.PI / 2 : 0;
            m.set(member.id, {
                x: ORPHAN_RADIUS * Math.cos(angle),
                y: ORPHAN_RADIUS * Math.sin(angle),
            });
        });
        return m;
    }, [orphans]);

    const syntheticNodes: FamilyNode[] = useMemo(
        () =>
            orphans.map((member) => ({
                member,
                big_id: null,
                depth: 0,
                littles: [],
            })) as FamilyNode[],
        [orphans],
    );

    return (
        <>
            <AutoCamera positions={positions} paddingScale={ORPHAN_PADDING_SCALE} />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 10]} intensity={0.6} color="#ffffff" />
            {syntheticNodes.map((node) => {
                const pos = positions.get(node.member.id);
                return pos ? (
                    <TreeNodeCard
                        key={node.member.id}
                        node={node}
                        position={pos}
                        isCurrentUser={node.member.id === currentUserId}
                        isHovered={hoveredId === node.member.id}
                        isSearchTop={searchTopMemberId === node.member.id}
                        onEnter={() => onHover(node.member.id)}
                        onLeave={() => onHover(null)}
                        onNodeClick={() => onNodeClick(node.member.id)}
                        onNodePointerDown={onNodePointerDown}
                    />
                ) : null;
            })}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas component — exported
// ─────────────────────────────────────────────────────────────────────────────

export interface FamilyTreeProps {
    family: Family | null;
    /** When set, an extra "Orphans" view is available at index families.length */
    orphans?: MemberWithRole[];
    families: Family[];
    activeFamilyIdx: number;
    onSwitchFamily: (idx: number) => void;
    currentUserId: string;
    hoveredId: string | null;
    onHover: (id: string | null) => void;
    onNodeClick: (memberId: string) => void;
    hasRelationships: boolean;
    canManage: boolean;
    /** When searching, the member id of the #1 result — its node gets a primary highlight */
    searchTopMemberId?: string | null;
}

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 4;
const DRAG_THRESHOLD = 4;

export function FamilyTree({
    family,
    orphans = undefined,
    families,
    activeFamilyIdx,
    onSwitchFamily,
    currentUserId,
    hoveredId,
    onHover,
    onNodeClick,
    hasRelationships,
    canManage,
    searchTopMemberId = null,
}: FamilyTreeProps) {
    useEffect(() => { injectStyles(); }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const targetZoomRef = useRef(1);
    const zoomFactorRef = useRef(1);
    const dragDeltaRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);

    useEffect(() => {
        targetZoomRef.current = 1;
        zoomFactorRef.current = 1;
    }, [activeFamilyIdx]);

    const setZoom = useCallback((fn: (prev: number) => number) => {
        const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fn(targetZoomRef.current)));
        targetZoomRef.current = next;
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const scale = 1 + e.deltaY * 0.002;
            targetZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoomRef.current * scale));
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[data-no-pan]') || target.closest('[data-family-tree-node]')) return;
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        containerRef.current?.setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > DRAG_THRESHOLD) hasDraggedRef.current = true;
        dragDeltaRef.current.x += e.movementX;
        dragDeltaRef.current.y += e.movementY;
    }, []);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        isDraggingRef.current = false;
        containerRef.current?.releasePointerCapture(e.pointerId);
    }, []);

    const handleNodePointerDown = useCallback(() => {
        hasDraggedRef.current = false;
    }, []);

    const handleNodeClick = useCallback((memberId: string) => {
        if (!hasDraggedRef.current) onNodeClick(memberId);
    }, [onNodeClick]);

    const controlsContextValue = useMemo<FamilyTreeControlsContextValue>(() => ({
        containerRef,
        targetZoomRef,
        zoomFactorRef,
        dragDeltaRef,
    }), []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full ft-canvas-bg overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{ touchAction: 'none' }}
        >
            {/* Canvas: family tree or orphans (disconnected) */}
            {(family || (orphans && orphans.length > 0)) && (
                <Canvas camera={{ fov: 50, near: 0.1, far: 1000 }} style={{ background: 'transparent' }}>
                    <FamilyTreeControlsContext.Provider value={controlsContextValue}>
                        {family ? (
                            <FamilyScene
                                key={activeFamilyIdx}
                                family={family}
                                currentUserId={currentUserId}
                                hoveredId={hoveredId}
                                searchTopMemberId={searchTopMemberId}
                                onHover={onHover}
                                onNodeClick={handleNodeClick}
                                onNodePointerDown={handleNodePointerDown}
                            />
                        ) : orphans && orphans.length > 0 ? (
                            <OrphanScene
                                key="orphans"
                                orphans={orphans}
                                currentUserId={currentUserId}
                                hoveredId={hoveredId}
                                searchTopMemberId={searchTopMemberId}
                                onHover={onHover}
                                onNodeClick={handleNodeClick}
                                onNodePointerDown={handleNodePointerDown}
                            />
                        ) : null}
                    </FamilyTreeControlsContext.Provider>
                </Canvas>
            )}

            {/* No-relationships overlay */}
            {!hasRelationships && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-center space-y-2 px-8">
                        <GitBranch className="h-7 w-7 mx-auto text-grey-3" />
                        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">No family connections yet</p>
                        {canManage && (
                            <p className="text-xs text-muted-foreground">
                                Use the link button to connect bigs and littles
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Overlay: nav dots + zoom rocker */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Nav dots: families + optional Orphans */}
                {(hasRelationships && families.length > 0) || (orphans && orphans.length > 0) ? (
                    <div data-no-pan className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-auto">
                        {families.map((f, i) => (
                            <button
                                key={f.root.id}
                                onClick={() => onSwitchFamily(i)}
                                title={`${f.root.full_name}'s Family`}
                                className="group relative flex items-center justify-end"
                            >
                                <div className={`transition-all duration-200 ${i === activeFamilyIdx ? 'w-2.5 h-2.5 bg-primary' : 'w-2 h-2 bg-grey-3 hover:bg-muted-foreground'}`} />
                                <span className="absolute right-full mr-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] bg-page text-foreground border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {f.root.full_name?.split(' ')[0]}'s Family
                                </span>
                            </button>
                        ))}
                        {orphans && orphans.length > 0 && (
                            <button
                                onClick={() => onSwitchFamily(families.length)}
                                title="Orphans (not in a family)"
                                className="group relative flex items-center justify-end"
                            >
                                <div className={`transition-all duration-200 ${activeFamilyIdx === families.length ? 'w-2.5 h-2.5 bg-primary' : 'w-2 h-2 bg-grey-3 hover:bg-muted-foreground'}`} />
                                <span className="absolute right-full mr-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] bg-page text-foreground border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Orphans
                                </span>
                            </button>
                        )}
                    </div>
                ) : null}

                {/* Zoom rocker */}
                <div data-no-pan className="absolute top-3 right-3 flex flex-col border border-border bg-page overflow-hidden pointer-events-auto">
                    <button
                        type="button"
                        onClick={() => setZoom(f => Math.max(f / 1.25, 0.4))}
                        className="p-2 hover:bg-tint transition-colors text-muted-foreground hover:text-foreground"
                        title="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    <div className="h-px bg-border" />
                    <button
                        type="button"
                        onClick={() => setZoom(f => Math.min(f * 1.25, 3))}
                        className="p-2 hover:bg-tint transition-colors text-muted-foreground hover:text-foreground"
                        title="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Keyboard hint */}
            {((hasRelationships && families.length > 0) || (orphans && orphans.length > 0)) && (families.length + (orphans?.length ? 1 : 0) > 1) && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none text-muted-foreground">
                    <kbd className="px-2 py-1 border border-border bg-page font-mono text-base leading-none">↑</kbd>
                    <kbd className="px-2 py-1 border border-border bg-page font-mono text-base leading-none">↓</kbd>
                    <span className="ml-0.5 font-mono text-[10px] uppercase tracking-[0.08em]">switch families</span>
                </div>
            )}
        </div>
    );
}

export default FamilyTree;
