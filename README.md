# Squat Framework

bare essential client side web app framework based on Deno / Typescript

### TODO / WIP
- ~~move 'get' and 'set' methods in scope to sanatize function (tuple?)~~
- ~~maybe introduce a 'model' Record ? instead of SQTObject~~
- ~~improve method names..~~
- create a special controller that can route (and has a 'deck')
- merge provider into the bootstrap of compiler, pre-define all controllers
- try to add the first css framework (qg bootstrap water or onsen)
- try recursive sqt-repeat

controllers: [
  {
     name:"",
     controller: ()=>{
     }
  },
]
templates: [
  {
    name: "bla.html",
    body: "<html></html>",
    controller: "name"
  }
]

