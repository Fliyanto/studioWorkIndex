//// FIND ELEMENTS
const introDialog = document.getElementById("intro-dialog");
const dialogCloseButton = document.getElementById("dialog-close-button");
const rangeSlider1 = document.getElementById("var1Range");
const rangeSlider2 = document.getElementById("var2Range");
const rangeSlider3 = document.getElementById("var3Range");
const rangeSlider4 = document.getElementById("var4Range");

//// UI INIT
// here we're setting the default values of the sliders
const range1DefaultValue = -6;
const range2DefaultValue = 5;
const range3DefaultValue = 50;

//// TONE INIT
// set up our basic synth
const synth = new Tone.Synth({
    oscillator: {
        type: "fatsawtooth",
        count: 3,
        spread: 10,
    },
    envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.1,
        attackCurve: "exponential",
    }
});

// set up our autoPanner and filter effects
const autoPanner = new Tone.AutoPanner("8n").start();
autoPanner.set({
    wet: 0.15
});

const filter = new Tone.Filter(0, "highpass");

// this function only runs after user interaction : ie closing the into dialog
// this is a special form of function using the async keyword : this lets us approach
// the running of statements in a specific manner : for example in the below function
// we use await to wait until the Tone system has started before running the following
// statement which connects the synth to the audio output
async function toneInit(){
    // "start" the tone audio system
    await Tone.start();
    // connect the synth to the audio output via the two effects
    // the flow of the audio signal looks like this
    // synth => autoPanner => filter => audio output (Tone.Destination)
    synth.chain(autoPanner, filter, Tone.Destination);
}

//// DIALOG INIT
// show modal on page load
introDialog.showModal();

dialogCloseButton.addEventListener("click", () => {
    introDialog.close();
});

introDialog.addEventListener("close", toneInit);

//// SOUND FUNCTIONS

// takes in a number to set as the new volume
function setVolume(newVolume){
    synth.set({ volume: newVolume });
}

//// UI CONNECTIONS

// assign default value
rangeSlider1.value = range1DefaultValue;
// add eventListener for use changing value
rangeSlider1.addEventListener("input", () => {
    setVolume(rangeSlider1.value);
});
// trigger change event manually to propagate the default value
rangeSlider1.dispatchEvent(new Event("input"));

// assign default value
rangeSlider2.value = range2DefaultValue;
// add eventListener for use changing value
// both rangeSlider2 and rangeSlider3's mechanisms are intentionally oblique
// if you're interested in what's happening please do ask me, but for the purposes
// of this exercise, leaving them 'uncommented' is appropriate as I want you to
// concentrate on your interpretation rather than how they actually operate
rangeSlider2.addEventListener("input", () => {
    let intValue = Math.floor(rangeSlider2.value);
    let newCount = clamp(1 + (intValue / 5), 3, 6);
    let newSpread = intValue * 2;
    synth.set({oscillator : {
            count: newCount,
            spread: newSpread
        }});
    autoPanner.set({
        wet: newSpread / 100
    });
});
// trigger change event manually to propagate the default value
rangeSlider2.dispatchEvent(new Event("input"));

// assign default value
rangeSlider3.value = range3DefaultValue;
// add eventListener for use changing value
rangeSlider3.addEventListener("input", () => {
    let value = rangeSlider3.value;
    if(value > 50){
        filter.set({
            frequency: clamp(remapRange(value, 60, 100, 0, 6000), 0, 6000),
            type: "highpass"
        });
    } else {
        filter.set({
            frequency: clamp(remapRange(value, 0, 40, 0, 20000), 0, 20000),
            type: "lowpass"
        });
    }
    synth.set({detune: remapRange(value, 0, 100, -1200, 1200)});
});
// trigger change event manually to propagate the default value
rangeSlider3.dispatchEvent(new Event("input"));



//// HELPER FUNCTIONS
// these are generic functions used to manipulate numbers

function remapRange(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * (value - min1) / (max1 - min1);
}

function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
}