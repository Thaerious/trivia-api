export default {
    get(target, prop) {
        if (typeof target[prop] !== "function") return Reflect.get(...arguments);
        
        return function (...args) {                    
            const validate = GameModel.validate(args[0], prop);
            if (!validate.valid) {
                throw new Error(validate.errors.map(x => x.stack).join("\n"));
            }
            return target[prop].apply(target, args);
        }
    }
}