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

    test.skip("Testando criação de hotspot com shape invalido :", () => {
        // Arrange :
        const shapeObject = null;//new RectShape(0.1, -0.2, 0.1, 0.1);

        // Act/Assert :
        expect(new HotSpot(shapeObject, 0)).toThrow();
    });

    test.skip("Testando criação de hotspot com index invalido :", () => {
        // Arrange :
        const rcs = new RectShape(0.1, -0.2, 0.1, 0.1);
        const invalidIndex = -1;

        // Act/Assert :
        expect(new HotSpot(rcs, invalidIndex)).toThrow();
    });

});