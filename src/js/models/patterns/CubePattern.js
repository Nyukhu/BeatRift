class CubePattern{

    constructor(h,speed){
        this.x = 0
        this.y = Math.random() * h
        this.xSpeed = speed / 15 // a remplacer par la valeur de freq
        this.ySpeed = 0 // a remplacer par la valeur de freq
    }

    update(){

        this.x += this.xSpeed;
        this.y += this.ySpeed;

    }
}
export default CubePattern;
