if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb+srv://DeltaRedd:-Maya983569-@mycluster-4kpi4.mongodb.net/test?retryWrites=true'}
}
else{
    module.exports = {mongoURI: 'mongodb://localhost:27017/gameEntries'}
}