/**
 * An enum containing the possible copy states for badges:
 * - fresh: No copy at all
 * - copy: A 1:1 copy, not allowing any changes
 * - fork: A fork, requiring changes to the title and image
 */
export enum CopyState {
    fresh,
    copy,
    fork
}
