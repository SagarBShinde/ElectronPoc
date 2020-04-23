let $ = require('jquery');

const createTreeBtn = document.getElementById('CreateBtn');
const jsonBtn = document.getElementById('jsondwnld');
const jsonTab = document.getElementById('jsonView');
const yamlTab = document.getElementById('yamlView');

createTreeBtn.addEventListener('click', function(event){
  console.log('Inside listner')
  let yamlData = readYaml();
  console.log("Yaml data is:"+ JSON.stringify(yamlData));
  let mainDiv = document.getElementById('main-listView');
  let rootListDiv = document.createElement("div");
  rootListDiv.setAttribute("id","rootListDiv");
  
  let expandButton = document.createElement("button");
    expandButton.setAttribute("class", "expand-button");
    expandButton.setAttribute("id", "root-expand-button");
    expandButton.innerHTML="&#43;"
  expandButton.addEventListener('click', function(){
    $("#root").toggle('visible');
  });  
  mainDiv.append(expandButton);
  mainDiv.appendChild(rootListDiv)
  rootListDiv.appendChild(createObjNode(yamlData, "root"));
  $('.yamlList').hide();
})

jsonTab.addEventListener ('click', function(event){
  const yaml = require('js-yaml');  
  let obj = new Object();
    obj['root'] = createJSONObj($("#root").children());
  $('#editor').val(JSON.stringify(obj.root, null, '\t'));
 
})

yamlTab.addEventListener ('click', function(event){
  const yaml = require('js-yaml');  
  let obj = new Object();

    obj['root'] = createJSONObj($("#root").children());

  $('#editor').val(yaml.safeDump(obj.root));
 
})
  function createJSONObj(nodeList){
    if (nodeList){
      let obj = new Object();
      nodeList.each( function (){
        console.log($(this).children('div').children('input').last().prop('class'));
        if ($(this).children('div').first().prop('class') === 'listItem'){
         let strVal = $(this).children('div').children('input').last().prop('value');
          console.log("strVal:"+ strVal);
          let valType = $(this).children('div').children('input').last().attr('type');  
          console.log("valType:"+ valType);
          console.log("***********"+ strToType(strVal,valType));
          obj[$(this).children('div').children('input').first().prop('value')] = strToType(strVal,valType);
        } else{
          if ($(this).children('div').first().prop('class') === 'ArrayListDiv'){
            let objArray = new Array();
            $(this).children('ul').first().children().each(function(index){
                if ($(this).children('div').first().prop('class') === 'listItem'){
                  let strVal = $(this).children('div').children('input').last().prop('value');
                  console.log("strVal:"+ strVal);
                  let valType = $(this).children('div').children('input').last().attr('type'); 
                  console.log("valType:"+ valType);
                  console.log("------------"+ strToType(strVal,valType));
                  objArray.push(strToType(strVal,valType));
                } else {
                objArray.push(createJSONObj($(this).children('ul').first().children()));
                }
            });
            obj[$(this).children('div').children('input').first().prop('value')] = objArray;
          } else {
          obj[$(this).children('div').children('input').first().prop('value')] = createJSONObj($(this).children('ul').first().children());
          }
        }
      })
    return obj;
  }

}


function createObjNode(jsonObj, divId){
  if (jsonObj === null)
  return;
  let objList = createList(divId);
  for (var i in jsonObj) {
    console.log("value of i is:" + i);
    console.log("value of obj[i] is:" + jsonObj[i]);
    console.log ("type of value:" + typeof jsonObj[i])
    let listDiv = createListItem(i,jsonObj[i]);
      objList.appendChild(listDiv);
      if (jsonObj[i] !== null && typeof(jsonObj[i])=="object" ){
        let list;
        if (jsonObj[i] instanceof Array){
          list = createObjNode(jsonObj[i], "array-list-"+i); 
        }else{
          list = createObjNode(jsonObj[i], "list-"+i);  
        }
        listDiv.appendChild(list); 
      }
    }
  return objList;
}

function createList(divId) {
  let list = document.createElement("ul");
  list.setAttribute("class", "yamlList");
  list.setAttribute("id",divId )
  return list;

}

function createListItem(yamlKey, yamlVal){
  let listItem = document.createElement('li')
  let listDiv = document.createElement("div");
  listDiv.setAttribute("id", yamlKey+'_div');
  listDiv.appendChild(createKeyItem(yamlKey));
  listDiv.appendChild(createSeparatorItem());
  
  if (typeof(yamlVal)!== "object") {
    listDiv.setAttribute("class", 'listItem');
    listDiv.appendChild(createValueItem(yamlVal));
  } else{
      if(yamlVal instanceof Array){
        listDiv.setAttribute("class", 'ArrayListDiv');
      }else{
        if (yamlVal === null){
          listDiv.setAttribute("class", 'listItem');
          listDiv.appendChild(createValueItem(""));
        } else {
        listDiv.setAttribute("class", 'listDiv');
        }
      }
    let expandButton = document.createElement("button");
    expandButton.setAttribute("class", "expand-button");
    expandButton.innerHTML="&#43;"
    listDiv.appendChild(expandButton);
    expandButton.addEventListener('click', function(){
      if (yamlVal instanceof Array){
        $(this).parent('div').next("#array-list-"+yamlKey).toggle('visible')
      }else{
        $(this).parent('div').next("#list-"+yamlKey).toggle('visible')
      }
    })
  }
 listItem.appendChild(listDiv)
  return listItem;
}

function createKeyItem(yamlKey){
  let keyNode = document.createElement('input');
  keyNode.setAttribute("id", yamlKey);
  keyNode.setAttribute("class", "keyInput");
  keyNode.setAttribute("type", getType(yamlKey));
  keyNode.setAttribute("value", yamlKey);
  return keyNode;

}

function createSeparatorItem(){
  let separatorNode = document.createElement("span");
  separatorNode.setAttribute("class", "separator")
  separatorNode.textContent = ":";
  return separatorNode;
}

function createValueItem(yamlval){
  let valNode = document.createElement('input');
  valNode.setAttribute("id", yamlval)
  valNode.setAttribute("class", "valInput")
  valNode.setAttribute("type", getType(yamlval));
  valNode.setAttribute("value", yamlval);
  return valNode;

}

function readYaml(){
  const fs = require('fs');
  const yaml = require('js-yaml');

  try {
    let fileContents = fs.readFileSync('./empl.yaml', 'utf8');
    //let fileContents = fs.readFileSync('./espn-app-android-app.yaml', 'utf8');
    let data = yaml.safeLoad(fileContents);
    return data
  } catch (e) {
    console.log(e);
  }
}

function getType(value){
  let val_type
  switch (typeof value){

    case 'number':
      val_type = 'number';   
      break;
    
    case 'string':
        val_type = 'text';   
        break;
    case 'boolean':
        val_type = 'boolean';   
        break;
    // add exception for invalid value type
    default:
      val_type ='';    
  }
  return val_type;
}

function strToType(strvalue, valType){
  let returnValue;
  switch (valType){

    case 'number':
      returnValue = Number(strvalue);
      break;
    case 'text':
       returnValue = strvalue;
      break;
    case 'boolean':
        returnValue = Boolean(strvalue);
        break;
    // add exception for invalid value type
    default:
      returnValue ='';    
  }
  return returnValue;
}









