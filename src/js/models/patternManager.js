import CubePattern from './patterns/CubePattern'

class patternManager{

    constructor(){
        this.spawnedObjs = []
    }

    generate(h,freq){
        let cube = new CubePattern(h,freq);
        this.spawnedObjs.push(cube)

    }
    update(){
        for (let i = 0; i < this.spawnedObjs.length; i++) {

            this.spawnedObjs[i].update()
           
        }
    }
    getObjects(){
        return this.spawnedObjs
    }

}
export default patternManager;
