class BinaryHeap<T> {

    private content: T[];
    private scoreFunction: Function;

    constructor(scoreFunction: Function) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }

    public push(element: T) {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }

    public pop(): T | undefined {
        if (this.content.length === 0) {
            return undefined;
        }

        const result = this.content[0];
        const end = this.content.pop();

        if (this.content.length > 0) {
            this.content[0] = end!;
            this.sinkDown(0);
        }

        return result;
    }

    public peek(): T | undefined {
        return this.content.length === 0 ? undefined : this.content[0];
    }

    public size(): number {
        return this.content.length;
    }

    public isEmpty(): boolean {
        return this.content.length === 0;
    }

    public remove(element: T) {
        const length = this.content.length;
        for (let i = 0; i < length; i++) {
            if (this.content[i] === element) {
                const end = this.content.pop();
                if (i === length - 1) {
                    break;
                }
                this.content[i] = end!;
                this.sinkDown(i);
                break;
            }
        }
    }

    private bubbleUp(index: number) {
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

    private sinkDown(index: number) {
        const element = this.content[index];
        let currentIndex = index;

        while (true) {
            const leftIndex = 2 * currentIndex + 1;
            const rightIndex = 2 * currentIndex + 2;
            let swapIndex: number | null = null;

            if (leftIndex < this.content.length) {
                if (this.scoreFunction(this.content[leftIndex]) < this.scoreFunction(element)) {
                    swapIndex = leftIndex;
                }
            }

            if (rightIndex < this.content.length) {
                const rightChildScore = this.scoreFunction(this.content[rightIndex]);
                if (
                    (swapIndex === null && rightChildScore < this.scoreFunction(element)) ||
                    (swapIndex !== null && rightChildScore < this.scoreFunction(this.content[leftIndex]))
                ) {
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

export { BinaryHeap }