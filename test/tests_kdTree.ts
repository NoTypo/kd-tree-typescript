import { kdTree } from '../src/kdTree';

// Haversine distance function for points in format {lat, lon}
function haversineDistance(point1: { lat: number; lon: number; }, point2: { lat: number; lon: number; }) {
    const R = 6371e3; // metres
    const φ1 = point1.lat * Math.PI / 180; // φ, λ in radians
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

// Test data
const points = [
    { lat: 50, lon: 0 },
    { lat: 51, lon: 0 },
    { lat: 52, lon: 0 },
];

type Test = () => void;

interface TestSuite {
    [key: string]: Test;
}

// Test suite
const testSuite: TestSuite = {
    "kdTree construction": () => {
        const tree = new kdTree(points, haversineDistance, ["lat", "lon"]);
        if (tree == null) throw new Error("Tree is null after construction");
    },
    "insert method": () => {
        const tree = new kdTree(points, haversineDistance, ["lat", "lon"]);
        tree.insert({ lat: 53, lon: 0 });
        if (!tree.exists({ lat: 53, lon: 0 })) throw new Error("Tree did not correctly insert point");
    },
    "remove method": () => {
        const tree = new kdTree(points, haversineDistance, ["lat", "lon"]);
        tree.insert({ lat: 53, lon: 0 });
        tree.remove({ lat: 53, lon: 0 });
        if (tree.exists({ lat: 53, lon: 0 })) throw new Error("Tree did not correctly remove point");
    },
    "exists method": () => {
        const tree = new kdTree(points, haversineDistance, ["lat", "lon"]);
        if (!tree.exists({ lat: 50, lon: 0 })) throw new Error("Tree did not correctly search point");
    },
    "nearestN method": () => {
        const tree = new kdTree(points, haversineDistance, ["lat", "lon"]);
        const nearest = tree.nearest({ lat: 51.5, lon: 0 }, 1);
        if (nearest[0][0].lat !== 51) throw new Error("Tree did not correctly find nearest point");
    }
}

for (const testName in testSuite) {
    try {
        testSuite[testName]();
        console.log(`Passed: ${testName}`);
    } catch (error: any) {
        console.error(`Failed: ${testName} - ${error.message}`);
    }
}
