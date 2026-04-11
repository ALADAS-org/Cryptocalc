const bs58 = require('bs58');

// Votre chaîne Base58
const b58String = "sssssssssssssssssssss";

console.log("Chaîne Base58:", b58String);
console.log("Longueur:", b58String.length, "caractères");

try {
    const bytes = bs58.decode(b58String);
    const hex = Buffer.from(bytes).toString('hex');
    
    console.log("\nRésultat du décodage:");
    console.log("Bytes:", bytes.length);
    console.log("Hex:", hex);
    console.log("Longueur hex:", hex.length, "caractères");
    console.log("Bits:", bytes.length * 8);
    
    // Vérifier si ça correspond à votre hex
    const votreHex = "071a8aed5a0fa3b5c26baecfdc3b823e";
    console.log("\nComparaison:");
    console.log("Votre hex:", votreHex);
    console.log("Longueur votre hex:", votreHex.length);
    console.log("Correspond ?", hex === votreHex);
    
} catch (error) {
    console.error("Erreur:", error.message);
}