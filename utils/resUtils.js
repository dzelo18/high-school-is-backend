exports.buildResponse = function(status, result, message){
    return {
        status: status,
        result: result,
        message: message
    }
}