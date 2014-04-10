exports.Registry = [];

exports.Command = function(name,usage,helpDef,min,max,funct){
    this._command = new Object();
    this._command.usage = usage;
    this._command.name= name;
    this._command.helpDef= helpDef;
    this._command.minArg = min;
    this._command.maxArg = max;
    this._command.oncall = funct;
}

exports.add = function(o){
    exports.Registry.push(o._command);
}