export default {
    body: "",
    write: function(text){
        this.body += text
    },
    set: function (value) {},
    end: function () { },
    json: function() { 
        return JSON.parse(this.body);
    },
    req: {
        origionalURL: "test"
    },
    status: function (n) {
        this.code = n;
    }
}

