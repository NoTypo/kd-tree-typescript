## k-d tree
This TypeScript implementation of a k-dimensional tree (kdTree) data structure is capable of efficient search, insertion, and removal of points in a k-dimensional space.

### Constructor
```
new kdTree(points: T[], metric: (a: T, b: T) => number, dimensions: string[])
```
Creates a new kdTree from an array of points, a distance function (metric), and an array of dimensions that specify the keys to use from the point objects.

### Insertion
```
insert(point: T): void
```
Inserts a new point into the kdTree. The point should be an object with properties matching the dimensions specified when the tree was created.

### Removal
```
remove(value: T): void
```
Removes a value from the kdTree if it matches (based on the metric function) one of the points previously inserted into the tree.

### Exists
```
exists(point: T): boolean
```
Checks if a point exists in the kdTree. Returns true if the point (or a point matching it according to the metric function) is found, and false otherwise.

### Nearest Neighbors
```
nearestN(point: T, N: number): T[]
```
Returns an array of the N nearest neighbors to a given point in the kdTree, according to the metric function.