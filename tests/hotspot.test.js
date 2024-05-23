const {FrameManager, Frame, HotSpot, RectShape, CircleShape} = require("../src/components");


describe("Gerenciando os hotspots e Shapes no Frame", function(){

   
    test("Testando adição de RectShape em Hotspot :", () => {
        // Arrange :
        const rcs = new RectShape(0.1, -0.2, 0.1, 0.1);
        const index2go = 0;

        // Act :
        const hs = new HotSpot(rcs, index2go);
        
        // Assert :
        // TODO : hs.shape should not be accessed directly 
        // TODO : hs.next should not be accessed directly 
        expect(hs.shape).toEqual(rcs);
        expect(hs.next).toEqual(index2go);
    });

    test("Testando adição de CircleShape em Hotspot :", () => {
        // Arrange :
        const rcs = new CircleShape(0.1, -0.2, 0.1);
        const index2go = 0;

        // Act :
        const hs = new HotSpot(rcs, index2go);
        
        // Assert :
        expect(hs.shape).toEqual(rcs);
        expect(hs.next).toEqual(index2go);
    });

    test("Testando criação de hotspot com shape invalido :", () => {
        // Arrange :
        const shapeObject = null;//new RectShape(0.1, -0.2, 0.1, 0.1);

        // Act
        const toFail = () => new HotSpot(shapeObject, 0);

        //Assert :
        expect(toFail).toThrow("Shape must be a value that implements for class AbstractShape");
    });

    test("Testando criação de hotspot com index invalido :", () => {
        // Arrange :
        const rcs = new RectShape(0.1, -0.2, 0.1, 0.1);
        const invalidIndex = -1;

        // Act
        const toFail = () => new HotSpot(rcs, invalidIndex);

        //Assert :
        expect(toFail).toThrow("Index must be a integer greater or equal to zero");
    });

});