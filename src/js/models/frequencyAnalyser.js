
class FrequencyAnalyser{


    /**
     *instanciate a FrequencyAnalyser
     * @param  precision : the number of mean bands resulting from the frequency array 
     * @param bandListnerStart: the start of the wanted section of the audio spectrum
     * @param bandListnerEnd: the end of the wanted section of the audio spectrum
     * @returns : retruns a FrequencyAnalyser
     */

    constructor(precision,bandListnerStart, bandListnerEnd){
        
        this.oldFrequencies = []
        this.frequencies = [];
        for (let i = 0; i < precision; i++) {
            this.frequencies.push(0);
            
        }
        this.variations = []
        this.ceil = 100;
        this.bandListnerStart = bandListnerStart
        this.bandListnerEnd = bandListnerEnd
        this.precision = precision
    }

    /**
     * simplify the audio spectrum to make processing lighter
     * @param frequencies: a frequency array containing all the audio spectrum at a given moment
     * @returns : an array of frequency means, the length of the array depends on the precision property
     */
    
    simplifyFrequencies(frequencies){
        let simplifiedFrequencies = [];
        frequencies = this.getBand(frequencies)

        simplifiedFrequencies = this.frequenciesMean(frequencies);
        return simplifiedFrequencies;
    }

     /**
     * simplify the audio spectrum to make processing lighter
     * @param frequencies: a frequency array containing all the audio spectrum at a given moment
     * @returns : none, sets the frequencyAnalyser frequency array
     */

    setFrequencies(frequencies){
        this.frequencies = this.simplifyFrequencies(Array.from(frequencies));
    }

    getFrequencies(){
        return this.frequencies;
    }
    
    getVariations(){
        return this.variations;
    }

    getHighestFrequency(){
        let Highestfrequency = this.frequencies[0]
        for (let i = 1; i < this.frequencies.length; i++) 
        {
            if(this.frequencies[i] > Highestfrequency)
                Highestfrequency = this.frequencies[i]
        }
        return Highestfrequency
    }

    /**
     * get the variations in the audio spectrum between now and the last update
     * @returns : none, sets the frequencyAnalyser variation array
     */
    computeVariations(){
        let varTab = []
        for (let i = 0; i < this.precision; i++) {
            let variation = 0;
            if(this.oldFrequencies[i] == 0)
            {
                this.oldFrequencies[i] = 1
            }
            variation = this.frequencies[i] * 100 / this.oldFrequencies[i]
            varTab.push(variation)
            
        }
        this.variations = varTab
    }

    updateAnalysis(frequencies){
        this.oldFrequencies = this.frequencies
        this.setFrequencies(frequencies)
        this.computeVariations()
        

    }

    /**
     * get the band of wanted values from an unprocessed frequency array
     * @param frequencies: a frequency array containing all the audio spectrum at a given moment
     * @returns : none, sets the frequencyAnalyser frequency array
     */

    getBand(frequencies){

        //frequencies.splice(0,this.bandListnerStart);
        //frequencies.splice(100,150);

        return frequencies;
    }


    /**
     * get an array of frequency means
     * @param frequencies: a frequency array containing all the audio spectrum at a given moment
     * @returns : an array of means based on the FrequencyAnalyser precision
     */

    frequenciesMean(frequencies){

        let numberOfBands = Math.floor(frequencies.length / this.precision);

        let meansArray = [];
        for (let i = 0; i < this.precision; i++) {
            let sum = 0;
            for (let j = i * numberOfBands; j < (i + 1)* numberOfBands; j++) {
                sum += frequencies[j];
            }
            meansArray.push(Math.floor(sum/numberOfBands));
        }

        return meansArray
    }

}
export default FrequencyAnalyser;
