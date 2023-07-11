class TreeNode {
    constructor(obj, dimension, parent) {
        this.obj = obj;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.dimension = dimension;
    }
}
class kdTree {
    constructor(points, metric, dimensions) {
        this.dimensions = dimensions;
        this.root = this.buildTree(points, 0, null);
        this.metric = metric;
    }
    buildTree(points, depth, parent) {
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
    insert(point) {
        const newNode = new TreeNode(point, 0, null);
        if (!this.root) {
            this.root = newNode;
        }
        else {
            this.innerInsert(this.root, newNode, 0);
        }
    }
    innerInsert(currentNode, newNode, depth) {
        const dim = depth % this.dimensions.length;
        if (newNode.obj[this.dimensions[dim]] < currentNode.obj[this.dimensions[dim]]) {
            if (!currentNode.left) {
                newNode.dimension = dim;
                newNode.parent = currentNode;
                currentNode.left = newNode;
            }
            else {
                this.innerInsert(currentNode.left, newNode, depth + 1);
            }
        }
        else {
            if (!currentNode.right) {
                newNode.dimension = dim;
                newNode.parent = currentNode;
                currentNode.right = newNode;
            }
            else {
                this.innerInsert(currentNode.right, newNode, depth + 1);
            }
        }
    }
    remove(value) {
        const nodeToRemove = this.findNodeByValue(this.root, value);
        if (nodeToRemove) {
            this.removeNode(nodeToRemove);
        }
    }
    removeNode(node) {
        if (node === this.root) {
            this.root = null;
            return;
        }
        if (node.parent) {
            if (node.parent.left === node) {
                node.parent.left = null;
            }
            else if (node.parent.right === node) {
                node.parent.right = null;
            }
        }
        this.innerRemove(node);
    }
    innerRemove(node) {
        if (!node) {
            return;
        }
        if (node.left && node.right) {
            const successor = this.findMin(node.right, node.dimension);
            if (successor) {
                node.obj = successor.obj;
                this.innerRemove(successor);
            }
            else {
                throw new Error("Should never reach here: successor cannot be null if right child exists.");
            }
        }
        else {
            const child = node.left || node.right;
            if (node.parent) {
                if (node.parent.left === node) {
                    node.parent.left = child;
                }
                else if (node.parent.right === node) {
                    node.parent.right = child;
                }
            }
            if (child) {
                child.parent = node.parent;
            }
        }
    }
    findMin(node, dimension) {
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
    minNode(x, y, z, dimension) {
        let min = x;
        if (y !== null && y.obj[this.dimensions[dimension]] < min.obj[this.dimensions[dimension]]) {
            min = y;
        }
        if (z !== null && z.obj[this.dimensions[dimension]] < min.obj[this.dimensions[dimension]]) {
            min = z;
        }
        return min;
    }
    findNodeByValue(currentNode, value) {
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
    exists(point) {
        return this.innerSearch(this.root, point, 0);
    }
    innerSearch(currentNode, point, depth) {
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
    nearest(point, N) {
        const nearestN = [];
        const distances = new BinaryHeap((item) => -item[1]);
        this.nearestNeighborN(this.root, point, 0, distances, N);
        while (nearestN.length < N && !distances.isEmpty()) {
            const [node, distance] = distances.pop();
            nearestN.push([node.obj, distance]);
        }
        return nearestN;
    }
    nearestNeighborN(currentNode, target, depth, distances, N) {
        if (!currentNode) {
            return;
        }
        const dimension = this.dimensions[depth % this.dimensions.length];
        const nodeDistance = this.metric(currentNode.obj, target);
        const linearPoint = Object.assign({}, currentNode.obj);
        linearPoint[dimension] = target[dimension];
        let bestChild = null;
        let otherChild = null;
        if (target[dimension] < currentNode.obj[dimension]) {
            bestChild = currentNode.left;
            otherChild = currentNode.right;
        }
        else {
            bestChild = currentNode.right;
            otherChild = currentNode.left;
        }
        this.nearestNeighborN(bestChild, target, depth + 1, distances, N);
        if (distances.size() < N || nodeDistance < distances.peek()[1]) {
            distances.push([currentNode, nodeDistance]);
            if (distances.size() > N) {
                distances.pop();
            }
        }
        const linearDistance = this.metric(linearPoint, currentNode.obj);
        if (distances.size() < N || Math.abs(linearDistance) < distances.peek()[1]) {
            this.nearestNeighborN(otherChild, target, depth + 1, distances, N);
        }
    }
}
export { kdTree, TreeNode };

class BinaryHeap {
    constructor(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }
    push(element) {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }
    pop() {
        if (this.content.length === 0) {
            return undefined;
        }
        const result = this.content[0];
        const end = this.content.pop();
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }
    peek() {
        return this.content.length === 0 ? undefined : this.content[0];
    }
    size() {
        return this.content.length;
    }
    isEmpty() {
        return this.content.length === 0;
    }
    remove(element) {
        const length = this.content.length;
        for (let i = 0; i < length; i++) {
            if (this.content[i] === element) {
                const end = this.content.pop();
                if (i === length - 1) {
                    break;
                }
                this.content[i] = end;
                this.sinkDown(i);
                break;
            }
        }
    }
    bubbleUp(index) {
        const element = this.content[index];
        const score = this.scoreFunction(element);
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.content[parentIndex];
            if (score >= this.scoreFunction(parent)) {
                break;
            }
            this.content[parentIndex] = element;
            this.content[index] = parent;
            index = parentIndex;
        }
    }
    sinkDown(index) {
        const element = this.content[index];
        let currentIndex = index;
        while (true) {
            const leftIndex = 2 * currentIndex + 1;
            const rightIndex = 2 * currentIndex + 2;
            let swapIndex = null;
            if (leftIndex < this.content.length) {
                if (this.scoreFunction(this.content[leftIndex]) < this.scoreFunction(element)) {
                    swapIndex = leftIndex;
                }
            }
            if (rightIndex < this.content.length) {
                const rightChildScore = this.scoreFunction(this.content[rightIndex]);
                if ((swapIndex === null && rightChildScore < this.scoreFunction(element)) ||
                    (swapIndex !== null && rightChildScore < this.scoreFunction(this.content[leftIndex]))) {
                    swapIndex = rightIndex;
                }
            }
            if (swapIndex === null) {
                break;
            }
            this.content[currentIndex] = this.content[swapIndex];
            this.content[swapIndex] = element;
            currentIndex = swapIndex;
        }
    }
}
export { BinaryHeap };
