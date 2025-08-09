// ====================================================================================
// ==============================   seedphrase2midi.js   ==============================
// ====================================================================================
"use strict";

const { Midi } = require('@tonejs/midi');
const fs = require('fs');

/**
 * Converts a byte array to a slow melody MIDI file
 * @param {Uint8Array} byteArray - Input byte array
 * @param {string} outputPath - Path to save the MIDI file
 * @param {object} options - Configuration options
 */
async function byteArrayToSlowMidi(byteArray, outputPath, options = {}) {
    // Default options
    const {
        tempo = 1,             // Very slow tempo (BPM)
        noteDuration = '1n',   // Half notes
        octaveRange = [3, 5],  // Middle octaves
        velocity = 60,         // Medium soft velocity
        instrument = 'acoustic grand piano',
        scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] // C Major scale
    } = options;

    try {
        // Create new MIDI file
        const midi = new Midi();
        
        // Add track with specified instrument
        const track = midi.addTrack();
        track.instrument.name = instrument;
        
        let time = 0;
        const noteSpacing = 60 / tempo; // Convert BPM to seconds per beat
        
        // Process each byte
        for (const byte of byteArray) {
            // Map byte to note parameters
            const scaleDegree = byte % scale.length;
            const octave = (byte % (octaveRange[1] - octaveRange[0] + 1)) + octaveRange[0];
            const noteName = `${scale[scaleDegree]}${octave}`;
            
            // Add note to track
            track.addNote({
                midi: noteNameToMidi(noteName),
                time: time,
                duration: noteDuration,
                velocity: velocity / 127 // Convert to 0-1 range
            });
            
            // Increment time for next note
            time += noteSpacing;
        }
        
        // Write MIDI file to disk
        const midiBytes = midi.toArray();
        fs.writeFileSync(outputPath, Buffer.from(midiBytes));
        
        console.log(`Successfully created slow melody MIDI at: ${outputPath}`);
    } catch (error) {
        console.error('Error creating MIDI file:', error);
        throw error;
    }
}

/**
 * Helper function to convert note name to MIDI number
 * Example: "C4" => 60
 */
function noteNameToMidi(noteName) {
    const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const match = noteName.match(/^([A-Ga-g][#b]?)(\d+)$/);
    if (!match) throw new Error(`Invalid note name: ${noteName}`);
    
    const [, pitch, octave] = match;
    const noteValue = noteMap[pitch.toUpperCase()];
    return 12 + (parseInt(octave) * 12) + noteValue;
}

// Example usage
(async () => {
    // Sample byte array (can be replaced with your actual data)
    const byteArray = new Uint8Array(
		[ 	72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79,
			72, 65, 83, 75, 69, 76, 76, 79
		]);
    const outputPath = 'slow_melody.mid';
    
    // Custom options (optional)
    const options = {
        tempo: 10, // Even slower
        noteDuration: '1n', // Quarter notes
        instrument: 'violin', // Different instrument
        scale: ['C', 'D', 'F', 'G', 'A'] // Pentatonic scale for more melodic results
    };
    
    await byteArrayToSlowMidi(byteArray, outputPath, options);
})();