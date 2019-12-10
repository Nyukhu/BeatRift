import PatternSelector from "./js/models/patternSelector";

document.addEventListener("DOMContentLoaded",function() {
    let patternSelector = new PatternSelector();
    patternSelector.test();

    // --------------------------------- LAYOUT SETUP
    let canvas      = document.querySelector("canvas");
    let c           = canvas.getContext("2d");
    let body        = document.querySelector("body");
    let rect        = body.getBoundingClientRect();

    canvas.width    = window.innerWidth;
    canvas.height   = window.innerHeight;

    let w           = canvas.width;
    let h           = canvas.height;

    // --------------------------------- AUDIO SETUP
    let audio       = document.querySelector("audio");
    let audioCtx    = new AudioContext();
    let analyser    = audioCtx.createAnalyser();
    let source      = audioCtx.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 512;
    audio.play();

    const frequencyData   = new Uint8Array(analyser.frequencyBinCount);

    // --------------------------------- MOUSE SETUP
    let mouse = {
        x   : null,
        y   : null
    }

    body.addEventListener("mousemove",function(event) {
        mouse.x = event.pageX
        mouse.y = event.pageY
    })

    // --------------------------------- PLAYER SETUP
    let player = {
        x           : w/2,
        y           : h/2,
        sx          : 5,
        sy          : 5,
        sizeX       : 20,
        sizeY       : 20,
        hittable    : true,
        hit         : false
    }
    // ------ general behavior
    let isMovingLeft    = false
    let isMovingRight   = false
    let isMovingUp      = false
    let isMovingDown    = false
    let lastKeyPressed  = null
    let canDash         = true
    let dashDelay       = 0

    // ------ controls
    body.addEventListener('keypress', (event) => {
        let key = event.code

        if (key === 'KeyA') {
            isMovingLeft    = true
            lastKeyPressed  = key
        }
        if (key === 'KeyD') {
            isMovingRight   = true
            lastKeyPressed  = key
        }
        if (key === 'KeyW') {
            isMovingUp      = true
            lastKeyPressed  = key
        }
        if (key === 'KeyS') {
            isMovingDown    = true
            lastKeyPressed  = key
        }
        if(key === 'Space' && canDash && dashDelay == 0 && (lastKeyPressed === 'KeyA' || lastKeyPressed === 'KeyD')) {
            player.sx       = 30
            canDash         = false
            player.hittable = false
        }
        else if(key === 'Space' && canDash && dashDelay == 0 && (lastKeyPressed === 'KeyW' || lastKeyPressed === 'KeyS')) {
            player.sy       = 30
            canDash         = false
            player.hittable = false
        }
        else {
            player.sx       = 5
            player.sy       = 5
            player.hittable = true
        }
    })

    body.addEventListener('keyup', (event) => {
        let key = event.code
        if (key === 'KeyA') {
            isMovingLeft    = false
        }
        if (key === 'KeyD') {
            isMovingRight   = false
        }
        if (key === 'KeyW') {
            isMovingUp      = false
        }
        if (key === 'KeyS') {
            isMovingDown    = false
        }
        if(key === 'Space') {
            player.sx       = 5
            player.sy       = 5
            player.hittable = true
        }
    })

    let delay               = 0;
    let trailDelay          = 0;
    let frequencyTab        = calcAverage(frequencyData);
    let spawnedObj          = [];
    let canDisplay          = true;
    let reseted             = false;
    let avgFerq             = 0;
    let songAvg             = 0;
    let songSum             = 0;
    let totalEllapsedTime   = 0;
    let allSongSum          = 0;
    let allSongAvg          = 0;

    let freq        = 0
    let beatDelay   = 0
    let alpha       = .1
    let wantedAlpha = 1

    function draw(){

        // --------------------------------- DIAGRAMS RENDER

        beatDelay++
        alpha += (-alpha+wantedAlpha)/100

        if(beatDelay % 100 == 0) {
            wantedAlpha = 1-wantedAlpha
        }

        // ----- style
        beatDelay > 300 && freq > 15000
            ? (
                c.fillStyle = "rgba(22, 22, 22, " + alpha + ")",
                    freq = 0
            )
            : (
                c.fillStyle = "rgba(22, 22, 22, " + alpha + ")"
            )

        for(let i in frequencyData) {
            let f = frequencyData[i]

            // ------ top
            c.beginPath()
            c.rect((w-(w/2))-i*15-7.5, h-(h/2), 13, -f)
            c.fill()
            c.beginPath()
            c.rect((w-(w/2))+i*15+7.5, h-(h/2), 13, -f)
            c.fill()

            // ------ bottom
            c.beginPath()
            c.rect((w-(w/2))-i*15-7.5, h-(h/2), 13, f)
            c.fill()
            c.beginPath()
            c.rect((w-(w/2))+i*15+7.5, h-(h/2), 13, f)
            c.fill()

            freq += f
        }

        // --------------------------------- PLAYER RENDER

        // ----- behavior
        if(!canDash) {
            dashDelay++
        }
        if(dashDelay >= 100) {
            canDash     = true
            dashDelay   = 0
        }

        isMovingLeft    ? player.x-=player.sx : ""
        isMovingRight   ? player.x+=player.sx : ""
        isMovingUp      ? player.y-=player.sy : ""
        isMovingDown    ? player.y+=player.sy : ""

        // ----- style
        c.beginPath()
        c.fillStyle     = "magenta"
        c.rect(player.x, player.y, player.sizeX, player.sizeY)
        c.fill()

        if(player.y > h) {
            player.y=0
        }
        if(player.y < 0) {
            player.y=h
        }
        if(player.x > w) {
            player.x=0
        }
        if(player.x < 0) {
            player.x=w
        }

        // --------------------------------- PLAYER RENDER

        // frequencyTab = calcAverage(frequencyData);
        let sum = 0

        for ( let i  = 0; i < frequencyData.length ; i++ )
        {
            let f = Math.floor(frequencyData[i]) ;
            sum += f
        }

        avgFerq     = sum / frequencyData.length;
        songSum    += avgFerq;
        allSongSum += avgFerq;
        songAvg     = songSum / delay;
        allSongAvg  = allSongSum / totalEllapsedTime;

        if ( trailDelay > 0 )
        {
            trailDelay  = 0;
            c.fillStyle = 'rgba(33,33,33,.3)';
            c.fillRect(0,0,canvas.width,canvas.height);
        }

        analyser.getByteFrequencyData(frequencyData);

        // --------------------------------- MUSIC
        c.fillStyle = "#CCCCCC";
        totalEllapsedTime ++;
        delay ++;
        trailDelay ++;

        if ( reseted == true )
        {
            canDisplay  = true;
            reseted     = false;
        }

        if ( canDisplay && (avgFerq > songAvg && delay > 5) || (avgFerq > 100 && delay > 2) )
        {
            songSum         = 0;
            delay           = 0;

            frequencyTab    = calcAverage( frequencyData );
            spawnedObj.push(spawnObjects( frequencyTab ));

            canDisplay      = false;
            reseted         = true;
        }

        for ( let i  = 0; i < frequencyTab.length ; i++ )
        {
            let f = Math.floor(frequencyTab[i]) ;

            c.beginPath();
            c.rect(i*11, 100, 10, f);
            c.fill();
        }

        c.font      = "12px Arial";
        c.fillStyle = "white";
        c.fillText( Math.floor(frequencyTab[0]), 10, 60 );
        c.fillText( Math.floor(frequencyTab[1]), 50, 60 );
        c.fillText( Math.floor(frequencyTab[2]), 100, 60 );
        c.fillText( Math.floor(frequencyTab[3]), 150, 60 );
        c.fillText( Math.floor(frequencyTab[4]), 200, 60 );
        c.fillText( Math.floor(frequencyTab[5]), 250, 60 );
        c.fillText( Math.floor(frequencyTab[6]), 300, 60 );
        c.fillText( Math.floor(frequencyTab[7]), 350, 60 );

        for ( let i = 0; i < spawnedObj.length; i++ )
        {
            c.beginPath();

            c.rect(spawnedObj[i].x, spawnedObj[i].y, spawnedObj[i].sizeX, spawnedObj[i].sizeY);
            c.fillStyle = spawnedObj[i].fillColor;

            spawnedObj[i].x += spawnedObj[i].xSpeed;
            spawnedObj[i].y += spawnedObj[i].ySpeed;


            if ( colision(spawnedObj[i],player) )
            {
                console.log("touched");
                player.hit = true;
            }

            if ( spawnedObj[i].x > w || spawnedObj[i].y > h )
            {
                spawnedObj.splice(i, 1);
                console.log("deleted");
            }
            c.fill();
        }

        if (!player.hit)
        {
            window.requestAnimationFrame(draw);
        }
        else
        {
            audio.pause();
        }
    }

    function calcAverage( frequencyTab ) {

        let intervale = frequencyTab.length /4;
        let results= [];
        let coeffs = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1, 1];

        for (let j = 1; j <= 8; j++) {

            let sum = 0;
            let start = 5 * (j - 1);
            let stop = 5 * j;
            for (let i = start; i < stop; i++) {
                sum += (frequencyTab[i]);
            }

            start += intervale;
            stop += intervale;
            results.push(sum/(5) * coeffs[j - 1]);

        }
        return results
    }

    function spawnObjects( frequencyTab ) {

        let maxIndex;
        let max         = 0;

        for ( let i = 0; i < frequencyTab.length; i++ )
        {
            if ( frequencyTab[i] > max )
            {
                maxIndex    = i;
                max         = frequencyTab[i];
            }
        }

        let obstacle    = { kind:"", x: 0, y: h/2, xSpeed: 5, ySpeed: 5, fillColor:"white",freqNum:1,size:2,sizeX: 10,sizeY: 10 };
        obstacle.kind   = setKind(frequencyTab[0]);

        switch (obstacle.kind) {
            case "BassBullet":
                obstacle.fillColor = "red";
                break;
        }

        obstacle.xSpeed     = 5 * frequencyTab[6] /80;
        obstacle.y          = getRnd(0,h);
        obstacle.ySpeed     = 0;
        obstacle.size       = 3;

        return obstacle;
    }

    function setKind( freq ) {

        let kind = "";

        if (freq > 200 && freq < 220)
        {
            kind = "wall";
        }
        if (freq > 220 && freq < 240)
        {
            kind = "sinBullet";
        }
        if (freq > 240)
        {
            kind = "BassBullet";
        }

        return kind;
    }

    function colision( obj, target ) {

        let collided = false;

        if ( obj.x < target.x + target.sizeX
            && obj.x + target.sizeX > target.x
            && obj.y < target.y + target.sizeY
            && obj.sizeY + obj.y > target.y )
        {
            collided = true;
        }

        return collided;
    }

    window.requestAnimationFrame(draw);
});


function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function getRnd(min, max) {
    return Math.random() * (max - min) + min;
}

console.log("cc");
