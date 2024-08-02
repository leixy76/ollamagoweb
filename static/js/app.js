
t = 0;
let resp = "";
var converter = new showdown.Converter();

function send(e){
    e.preventDefault();
    var prompt = $("#prompt").val().trimEnd();
    $("#prompt").val("");
    autosize.update($("#prompt"));

    $("#printout").append(
        "<div class='prompt-message'>" + 
        "<div style='white-space: pre-wrap;'>" +
        "Quest:"+prompt  +
        "</div>" +
        "<span class='message-loader js-loading spinner-border'></span>" +
        "</div>"             
    );        
    window.scrollTo({top: document.body.scrollHeight, behavior:'smooth' });
    runScript(prompt);          
    $(".js-logo").addClass("active");
};

document.getElementById("btnSave").addEventListener("click", () => {
    let date = new Date();
    let FileName = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`.replace(/\s/g, '');
    const txt = document.getElementById('printout').innerHTML;
    const blob = new Blob([txt], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    const ele = document.createElement("A");
    ele.href = url;
    ele.download = "llm${FileName}.html";
    ele.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});


$(document).ready(function(){  
    $('#prompt').keypress(function(event){        
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if((keycode == 10 || keycode == 13) && event.ctrlKey){
            send(event);
            return false;
        }
    });       
    autosize($('#prompt'));    
});  

async function runScript(prompt, action="/run") {    
    id = Math.random().toString(36).substring(2,7);
    outId = "result-" + id;
    
    $("#printout").append(
        "<div class='px-3 py-3'>" + 
        "<div id='" + outId + 
        "' style='white-space: pre-wrap;'>" +         
        "</div>" +
        "</div>" 
    );  

    response = await fetch("/run", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({input: prompt}),
    });

    decoder = new TextDecoder();
    reader = response.body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        $("#"+outId).append(decoder.decode(value));
        window.scrollTo({top: document.body.scrollHeight, behavior:'smooth' });
    }
    $(".js-loading").removeClass("spinner-border");        
    $("#"+outId).html(converter.makeHtml($("#"+outId).html()));
    window.scrollTo({top: document.body.scrollHeight, behavior:'smooth' });    
    hljs.highlightAll();
}
