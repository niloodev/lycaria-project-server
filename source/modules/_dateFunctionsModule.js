module.exports = {
    // Retorna a data em DD/MM/AAAA, parâmetro PROTÓTIPO DE OBJETO DATE().
    returnDate: function(dateObj){
        var day = (dateObj.getDate() < 10) ? '0'+dateObj.getDate() : dateObj.getDate();
        var month = (dateObj.getMonth() < 10) ? '0'+(dateObj.getMonth()+1) : (dateObj.getMonth()+1);
        var year = dateObj.getFullYear();
        
        return day+'/'+month+'/'+year;
    },

    // Retorna a hora no formato HH:MM:SS, parâmetro PROTÓTIPO DE OBJETO DATE().
    returnHour: function(dateObj){ 
        var hour = (dateObj.getHours() < 10) ? '0'+dateObj.getHours() : dateObj.getHours();
        var minutes = (dateObj.getMinutes() < 10)  ? '0'+dateObj.getMinutes() : dateObj.getMinutes();
        var seconds = (dateObj.getSeconds() < 10) ? '0'+dateObj.getSeconds() : dateObj.getSeconds();
    
        return `${hour}:${minutes}:${seconds}`;
    }
}