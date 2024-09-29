const MAX_LEN = 5

export function generateId(){
    let asn = "";
    const subset = "123456789qwertyuiopasdfghjklzxcvbnm"
    for(let i =0;i < MAX_LEN;i++){
        asn +=subset[Math.floor(Math.random()* subset.length)];
    }
    return asn;
}