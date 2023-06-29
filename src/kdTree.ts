import { BinaryHeap } from './BinaryHeap';

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

type Dimensional = {
    [key: string]: number;
}

type NodeDistance<T> = {
    node: TreeNode<T> | null,
    distance: number
}

class kdTree<T extends Dimensional> {

    private dimensions: string[];
    private root: TreeNode<T> | null;
    private metric: (a: T, b: T) => number;

    constructor(points: T[], metric: (a: T, b: T) => number, dimensions: string[]) {
        this.dimensions = dimensions;
        this.root = this.buildTree(points, 0, null);
        this.metric = metric;
    }

    private buildTree(points: T[], depth: number, parent: TreeNode<T> | null): TreeNode<T> | null {
        const dim = depth % this.dimensions.length;

        if (points.length === 0) {
            return null;
        }
        if (points.length === 1) {
            return new TreeNode(points[0], dim, parent);
        }

        points.sort((a, b) => a[this.dimensions[dim]] - b[this.dimensions[dim]]);

        const median = Math.floor(points.length / 2);
        const node = new TreeNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

        return node;
    }

    public insert(point: T): void {
        const newNode = new TreeNode(point, 0, null);
        if (!this.root) {
            this.root = newNode;
        } else {
            this.innerInsert(this.root, newNode, 0);
        }
    }

    private innerInsert(currentNode: TreeNode<T>, newNode: TreeNode<T>, depth: number): void {
        const dim = depth % this.dimensions.length;

        if (newNode.obj[this.dimensions[dim]] < currentNode.obj[this.dimensions[dim]]) {
            if (!currentNode.left) {
                newNode.dimension = dim;
                newNode.parent = currentNode;
                currentNode.left = newNode;
            } else {
                this.innerInsert(currentNode.left, newNode, depth + 1);
            }
        } else {
            if (!currentNode.right) {
                newNode.dimension = dim;
                newNode.parent = currentNode;
                currentNode.right = newNode;
            } else {
                this.innerInsert(currentNode.right, newNode, depth + 1);
            }
        }
    }

    public remove(value: T): void {
        const nodeToRemove = this.findNodeByValue(this.root, value);
        if (nodeToRemove) {
            this.removeNode(nodeToRemove);
        }
    }

    private removeNode(node: TreeNode<T>): void {
        if (node === this.root) {
            this.root = null;
            return;
        }

        if (node.parent) {
            if (node.parent.left === node) {
                node.parent.left = null;
            } else if (node.parent.right === node) {
                node.parent.right = null;
            }
        }

        this.innerRemove(node);
    }

    private innerRemove(node: TreeNode<T> | null): void {
        if (!node) {
            return;
        }

        if (node.left && node.right) {
            const successor = this.findMin(node.right, node.dimension);
            if (successor) {
                node.obj = successor.obj;
                this.innerRemove(successor);
            } else {
                throw new Error("Should never reach here: successor cannot be null if right child exists.");
            }
        } else {
            const child = node.left || node.right;
            if (node.parent) {
                if (node.parent.left === node) {
                    node.parent.left = child;
                } else if (node.parent.right === node) {
                    node.parent.right = child;
                }
            }
            if (child) {
                child.parent = node.parent;
            }
        }
    }

    private findMin(node: TreeNode<T> | null, dimension: number): TreeNode<T> | null {
        if (node === null) {
            return null;
        }

        const dim = node.dimension;

        if (dim === dimension) {
            if (node.left !== null) {
                return this.findMin(node.left, dimension);
            }
        }

        let min = node;
        let leftMin = this.findMin(node.left, dimension);
        let rightMin = this.findMin(node.right, dimension);

        if (leftMin !== null && leftMin.obj[this.dimensions[dimension]] < min.obj[this.dimensions[dimension]]) {
            min = leftMin;
        }
        if (rightMin !== null && rightMin.obj[this.dimensions[dimension]] < min.obj[this.dimensions[dimension]]) {
            min = rightMin;
        }

        return min;
    }

    private minNode(x: TreeNode<T>, y: TreeNode<T> | null, z: TreeNode<T> | null, dimension: number): TreeNode<T> {
        let min = x;
        if (y !== null && y.obj[this.dimensions[dimension]] < min.obj[this.dimensions[dimension]]) {
            min = y;
        }
        if (z !== null && z.obj[this.dimensions[dimension]] < min.obj[this.dimensions[dimension]]) {
            min = z;
        }
        return min;
    }

    private findNodeByValue(currentNode: TreeNode<T> | null, value: T): TreeNode<T> | null {
        if (!currentNode) {
            return null;
        }

        if (this.metric(currentNode.obj, value) === 0) {
            return currentNode;
        }

        const dim = currentNode.dimension;
        const nextNode = value[this.dimensions[dim]] < currentNode.obj[this.dimensions[dim]] ? currentNode.left : currentNode.right;
        return this.findNodeByValue(nextNode, value);
    }

    public exists(point: T): boolean {
        return this.innerSearch(this.root, point, 0);
    }

    private innerSearch(currentNode: TreeNode<T> | null, point: T, depth: number): boolean {
        if (!currentNode) {
            return false;
        }

        if (this.metric(currentNode.obj, point) === 0) {
            return true;
        }

        const dim = depth % this.dimensions.length;
        const nextNode = point[this.dimensions[dim]] < currentNode.obj[this.dimensions[dim]]
            ? currentNode.left
            : currentNode.right;

        return this.innerSearch(nextNode, point, depth + 1);
    }

    public nearest(point: T, N: number): [T, number][] {
        const nearestN: [T, number][] = [];
        const distances = new BinaryHeap<[TreeNode<T>, number]>(
            (item: [TreeNode<T>, number]) => -item[1]
        );

        this.nearestNeighborN(this.root, point, 0, distances, N);

        while (nearestN.length < N && !distances.isEmpty()) {
            const [node, distance] = distances.pop()!;
            nearestN.push([node.obj, distance]);
        }

        return nearestN;
    }


    private nearestNeighborN(
        currentNode: TreeNode<T> | null,
        target: T,
        depth: number,
        distances: BinaryHeap<[TreeNode<T>, number]>,
        N: number
    ): void {
        if (!currentNode) {
            return;
        }

        const dimension = this.dimensions[depth % this.dimensions.length];
        const nodeDistance = this.metric(currentNode.obj, target);

        // linearPoint is the projected target on current dim passing the currentNode
        const linearPoint: T = { ...currentNode.obj };
        linearPoint[dimension as keyof T] = target[dimension as keyof T];

        let bestChild: TreeNode<T> | null = null;
        let otherChild: TreeNode<T> | null = null;

        if (target[dimension as keyof T] < currentNode.obj[dimension as keyof T]) {
            bestChild = currentNode.left;
            otherChild = currentNode.right;
        } else {
            bestChild = currentNode.right;
            otherChild = currentNode.left;
        }

        this.nearestNeighborN(bestChild, target, depth + 1, distances, N);

        if (distances.size() < N || nodeDistance < distances.peek()![1]) {
            distances.push([currentNode, nodeDistance]);
            if (distances.size() > N) {
                distances.pop();
            }
        }

        // Explore the other half if either the heap is not full or 
        // the linearPoint-target distance is less than the distance from target to the farthest point in the heap
        const linearDistance = this.metric(linearPoint, currentNode.obj);
        if (distances.size() < N || Math.abs(linearDistance) < distances.peek()![1]) {
            this.nearestNeighborN(otherChild, target, depth + 1, distances, N);
        }
    }

}

export { kdTree, TreeNode }