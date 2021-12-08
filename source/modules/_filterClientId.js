module.exports = (clients, id)=>{
    try {
        var l_ = clients.find(el => {return (el['_id']).toString() == (id).toString()});
        return l_;
    } catch(e) {
        return undefined;
    }
}