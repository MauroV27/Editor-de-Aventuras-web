const {FrameManager, Frame, HotSpot, RectShape, CircleShape} = require("../src/components")

describe("Gerenciando frames e hotspots no FrameManager", function(){

    test("FrameManager singletong está funcionando :", () => {
        // Arrange :
        const fmA = new FrameManager();
        const fmB = new FrameManager();

        // Assert : 
        expect(fmA).toEqual(fmB);
    });
    
    test("Criando frame com hotspot no FrameManager", () => {
        // Arrange :
        const fm = new FrameManager();
        fm.clear();

        const w_ = 960;
        const h_ = 540;
        const frame1 = new Frame("img-teste.png", "FRame teste");
        frame1.addHotSpot( new HotSpot( new CircleShape(100/w_, 250/h_, 50/w_), 1) )
        
        const frame2 = new Frame("img-teste.png", "Borrao teste");
        frame2.addHotSpot( new HotSpot( new RectShape(50 / w_, 80 / h_, 50 / w_, 50 / h_), 0));
        frame2.addHotSpot( new HotSpot( new RectShape(200 / w_, 100/ h_, 50 / w_, 50/ h_), 0));
        
        // Act :
        fm.addFrame( frame1 );
        fm.addFrame( frame2 );

        // Assert : 
        const frameList = fm.getFrames();

        expect(frameList.length).toEqual(2);    // Num frames OK
        expect(frameList[1]).toEqual(frame2);   // Num Hotspots in frame 2 
    });

    test("Apagando dados do FrameManager", () => {
        // Arrange : 
        const fm = new FrameManager();
        fm.addFrame( new Frame("img-teste.png", "FRame teste") );

        // ACt : 
        fm.clear();

        // Assert :
        expect(fm.getFrames().length).toEqual(0);
    });

    test("Apagando frame :", () => {
        // Arrange : 
        const fm = new FrameManager();     
        fm.clear();   

        fm.addFrame( new Frame("img-teste-A.png", "FRame teste A") ); // 0
        const frame2 = new Frame("img-teste-B.png", "FRame teste B"); // 1
        fm.addFrame( frame2 );
        fm.addFrame( new Frame("img-teste-C.png", "FRame teste C") ); // 2

        // Act : 
        fm.deleteFrame( 2 );

        // Assert : 
        expect( fm.getFrames().length ).toEqual( 2 );
        expect( fm.getFrame(1) ).toEqual(frame2);

    });

});


describe("Manipulando dados em export e import no FrameManager", function() { 

    test.skip("Testando export de dados do FrameManager :", () => {});

    test.skip("Testando import de dados do FrameManager :", () => {});

    test("Testando import de dados para uma resolução diferente : ", () => {
        // Arrange :
        const fm = new FrameManager();
        fm.clear();

        const w_ = 960;
        const h_ = 540;
        const frame1 = new Frame("img-teste.png", "FRame teste");
        frame1.addHotSpot( new HotSpot( new CircleShape(100/w_, 250/h_, 50/w_), 1) );
        
        const frame2 = new Frame("img-teste.png", "Borrao teste");
        frame2.addHotSpot( new HotSpot( new RectShape(50 / w_, 80 / h_, 50 / w_, 50 / h_), 0));
        frame2.addHotSpot( new HotSpot( new RectShape(200 / w_, 100/ h_, 50 / w_, 50/ h_), 0));
        
        fm.addFrame( frame1 );
        fm.addFrame( frame2 );
        
        // Act :
        const exported = fm.exportDataInJSON(w_, h_, 10);

        fm.clear();

        const w_new = (w_ - 20) * 2;
        const h_new = (h_ - 20) * 2;

        fm.importDataInJSON(exported, w_new, h_new, 0);

        // Assert : 
        expect(fm.getFrames().length).toEqual(2);
        expect(fm.getFrame(1).getHotSpots().length).toEqual(2)

        // Compare scale from old circle hotpost with new:
        const newFrame1 = fm.getFrame(0)
        const newCircleShape = newFrame1.getHotSpots()[0].shape;
        const fltparse = (num) => (parseFloat(num).toPrecision(3));

        expect( fltparse(newCircleShape.x) ).toEqual( fltparse((100/w_) ) );
        expect( fltparse(newCircleShape.y) ).toEqual( fltparse((250/h_) ) );

        expect( newFrame1.next ).toEqual( frame1.next );
    });

});
