
let  n = 5
let x = '' //O(1)
let y = (2*n) - 2
let arr = [1,2] //O(n)
//O(n ^ 2) // O(1)
newArr = [1,2,3] //4 //6
//O(n) O(1) ---> O(log(N)) ---> O(1)

for(let i = 0; i <= y ; i++){
    for(let j = 0; j<= y; j++){
        if(i === j && i+j === y){
            x += '* '
        }else{
            if( i === j || i+j === y){
                x += '*'
            }else{
                x += '  '
            }
        }
        
    }
    x += '\n'
}

console.log(x)