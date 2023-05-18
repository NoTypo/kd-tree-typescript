class TreeNode<T> {

    public obj: T;
    public left: TreeNode<T> | null;
    public right: TreeNode<T> | null;
    public parent: TreeNode<T> | null;
    public dimension: number;

    constructor(obj: T, dimension: number, parent: TreeNode<T> | null) {
        this.obj = obj;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.dimension = dimension;
    }
    
}

class kdTree<T> {

    private dimenstions: string[];
    private root: TreeNode<T> | null;
    private metric: (a: T, b: T) => number;

    constructor(points: T[], metric: (a: T, b: T) => number, dimensions: string[]) {
        this.dimenstions = dimensions;
        this.root = this.buildTree(points, 0, null);
        this.metric = metric;
    }

    private buildTree(points: T[], depth: number, parent: TreeNode<T> | null): TreeNode<T> | null {
        const dim = depth % this.dimenstions.length;

        if (points.length === 0) {
            return null;
        }
        if (points.length === 1) {
            return new TreeNode(points[0], dim, parent);
        }

        points.sort((a, b) => a[this.dimenstions[dim]] - b[this.dimenstions[dim]]);

        const median = Math.floor(points.length / 2);
        const node = new TreeNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

        return node;
    }

}