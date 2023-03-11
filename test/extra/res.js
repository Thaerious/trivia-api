export default {
    body: "",
    write: function(text){
        body += text
    },
    set: function (value) {},
    end: function () { },
    json: function() { 
        return JSON.parse(this.body);
    }
}

