const CoinKey = require('coinkey');
let privateKeyHex = "6893b5807ad0970e1ad51697ea3c09f4b46008ba2f8582068ee9ba90517f6504";

// OK :    Bitcoin  address: 1PvidEhy8YtgpF7FXMYw1FJyTY8azwybHr
// tester: DogeCoin address: DU4pAVecRxnyMFHrFwYVZ1UaLfrtJxu856
 
// Bitcoin / DogeCoin WIF
let key = new CoinKey(new Buffer.from(privateKeyHex, 'hex'));

key.compressed = true;
console.log(key.privateWif);        // => Kzizf2rqQtRcyt6hxV2pMPMo4wtigcUA6ZioScxN6LuutNvdnGrr
// import Guarda  Bitcoin  ** OK **    => 1PvidEhy8YtgpF7FXMYw1FJyTY8azwybHr
// import Guarda  DogeCoin ** OK **    => DU4pAVecRxnyMFHrFwYVZ1UaLfrtJxu856