const request = require("supertest");

// Mock de la base de datos para evitar conexión real durante tests
jest.mock("../config/database", () => ({
    query: jest.fn(),
    on: jest.fn(),
    connect: jest.fn(),
}));

// Mock de @turf/turf para evitar problemas de ESM/CJS
jest.mock("@turf/turf", () => ({
    point: jest.fn(),
    polygon: jest.fn(),
    booleanPointInPolygon: jest.fn(),
    distance: jest.fn(),
    lineString: jest.fn(),
    length: jest.fn(),
    featureCollection: jest.fn(),
    centroid: jest.fn(),
    buffer: jest.fn(),
    simplify: jest.fn(),
    nearestPointOnLine: jest.fn(),
    area: jest.fn(),
    lineIntersect: jest.fn(),
    booleanValid: jest.fn(),
    envelope: jest.fn(),
    helpers: {
        point: jest.fn(),
        polygon: jest.fn(),
        lineString: jest.fn(),
    }
}));

// Mock manual de helpers si turfUtils los importa parcial o totalmente
// Si el código usa require('@turf/turf'), el mock de arriba debería bastar.

const app = require("../server");

describe("Health Check API", () => {
    it("should return 200 and a success message", async () => {
        // Silencia console.logs del servidor
        const originalLog = console.log;
        console.log = jest.fn();

        const res = await request(app).get("/api/health");

        // Restaurar console.log
        console.log = originalLog;

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message");
    });
});
