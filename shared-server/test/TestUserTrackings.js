
const chai = require('chai');
var chaiHttp = require('chai-http');
const assert = chai.assert;
const expect = chai.expect;
var statusTracking = require('../others/Constants');

chai.use(chaiHttp);

const APP = require('../service/express');
const server = APP.listen();


//global varibles
var username = 'juan-gonzales' + Math.random()*1000000000;
var password = 'juan-gonzales-pass';
var tokenUser;
var token_server1;
var token_server2;

var server_id_1;
var server_id_2;

var dataCreated_1='alguien1';
var dataName_1 = 'server-----1'+ Math.random()*1000000000;
var dataCreated_2 = 'alguien2';
var dataName_2 = 'sever-------2'+ Math.random()*1000000000;
var dataUrl1 = 'urkadasdasdads';
var dataUrl2 = 'ent**++$$-##- 2000**';

var id_tracking1_server1;
var id_tracking1_server2;
var id_payment1_server_1;
var id_payment1_server_2;


describe('TEST',() =>{
    it('BEGIN TEST',(done) =>{
        console.log("======================================");
        console.log("=========TEST USER TRACKING===========");
        console.log("======================================");
        done();
    });
});



describe('test regiter', ()=>{
    it('sould register with success', (done)=>{
        chai.request(server) 
            .post('/api/user/register')
            .send({username:username, password:password})
            .end(function(err,res){
                expect(res).to.have.status(201);
                done();
            })
    });
});


describe('test login', ()=>{
    it('sould login with success', (done)=>{
        chai.request(server) 
            .post('/api/user/login')
            .send({username:username, password:password})
            .end(function(err,res){
                expect(res).to.have.status(201);
                var object = JSON.parse(res.text);
                tokenUser = object.token.token;
                done();
            })
    });
});

//---------------------------------------------------------


describe('test create server_1', ()=>{
    it('sould create server_1 successfully', (done)=>{
        chai.request(server) 
            .post('/api/servers')
            .send({createdBy:dataCreated_1, name:dataName_1, url:dataUrl1})
            .end(function(err,res){
                expect(res).to.have.status(201);
                var object = JSON.parse(res.text);
                token_server1 = object.server.token.token;
                server_id_1 = object.server.server.id;
                done();
            })
    });
});


describe('test create server_2', ()=>{
    it('sould create server_2 successfully', (done)=>{
        chai.request(server) 
            .post('/api/servers')
            .send({createdBy:dataCreated_2, name:dataName_2, url:dataUrl2})
            .end(function(err,res){
                expect(res).to.have.status(201);
                var object = JSON.parse(res.text);
                token_server2 = object.server.token.token;
                server_id_2 = object.server.server.id;
                done();
            })
    });
});


//%%%%%%%%%%PAYMENTS ASSOCIATED TO TRACKINGS%%%%%

describe('create payment 1 for test server 1 ',()=>{
    it('should create with success because it is authorized',(done)=>{
        chai.request(server) 
            .post('/api/payments')
            .set({'authorization':token_server1})
            .send({
                "currency":"pesos",
                "value":"10000",
                    "paymentMethod":{
                        "expiration_month":"8",
                        "expiration_year":"2020",
                        "method":"method1",
                        "number":"----",
                        "type":"-----"
                    }
            })
            .end(function(err,res){
                expect(res).to.have.status(201);
                id_payment1_server_1 = res.body.transaction_id;
                done();
            });
    });
});

describe('create payment 1 for test server 2 ',()=>{
    it('should create with success because it is authorized',(done)=>{
        chai.request(server) 
            .post('/api/payments')
            .set({'authorization':token_server2})
            .send({
                "currency":"pesos",
                "value":"902000",
                    "paymentMethod":{
                        "expiration_month":"",
                        "expiration_year":"",
                        "method":"method3",
                        "number":"",
                        "type":""
                    }
            })
            .end(function(err,res){
                expect(res).to.have.status(201);
                id_payment1_server_2 = res.body.transaction_id;
                done();
            });
    });
});



//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%





//-------------------------------------------------------


describe('create tracking for server 1', ()=>{
    it('should create tracking successfully and it is associated to a payment', (done)=>{
        chai.request(server) 
            .post('/api/trackings')
            .set({authorization:token_server1})
            .send({id:id_payment1_server_1})
            .end( function(err,res){
                expect(res).to.have.status(201);
                var object = JSON.parse(res.text);
                id_tracking1_server1 = object.id;
                done();
            });
    });
});


describe('create tracking for server 2', ()=>{
    it('should create tracking successfully and it is associated to a payment', (done)=>{
        chai.request(server) 
            .post('/api/trackings')
            .set({authorization:token_server2})
            .send({id: id_payment1_server_2})
            .end( function(err,res){
                expect(res).to.have.status(201);
                var object = JSON.parse(res.text);
                id_tracking1_server2 = object.id;
                done();
            });
    });
});

//-------------------------------------------------

describe('get single tracking of the server 1',()=>{
    it('should obtain tracking successfully',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+ id_tracking1_server1)
            .set({authorization:token_server1})
            .end(function(err,res){
                expect(res).to.have.status(200);
                var object = JSON.parse(res.text);
                assert.equal(id_tracking1_server1,object.id);
                done();
            });
    });
});


describe('get single tracking of the server 2',()=>{
    it('should obtain tracking successfully',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+id_tracking1_server2)
            .set({'authorization':token_server2})
            .end(function(err,res){
                expect(res).to.have.status(200);
                var object = JSON.parse(res.text);
                assert.equal(id_tracking1_server2,object.id);
                done();
            });
    });
});

//-------------------------------------------------------


describe('get single tracking of the server2 in server 1',()=>{
    it('should fail because server1 no contain that tracking',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+ id_tracking1_server2)
            .set({authorization:token_server1})
            .end(function(err,res){
                expect(res).to.have.status(404);
                var object = JSON.parse(res.text);
                assert.equal(404,object.code);
                done();
            });
    });
});


describe('get single tracking of the server1 in server 2',()=>{
    it('should fail because server2 no contain that tracking',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+id_tracking1_server1)
            .set({'authorization':token_server2})
            .end(function(err,res){
                expect(res).to.have.status(404);
                var object = JSON.parse(res.text);
                assert.equal(404,object.code);
                done();
            });
    });
});


//------------------------------------------------------


describe('get single tracking of the server2 by the admin',()=>{
    it('should obtain succesfully because admin can obtain all trackings',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+ id_tracking1_server2)
            .set({authorization:tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(200);
                var object = JSON.parse(res.text);
                assert.equal(id_tracking1_server2,object.id);
                done();
            });
    });
});


describe('get single tracking of the server1 by the admin',()=>{
    it('should obtain succesfully because admin can obtain all trackings',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+id_tracking1_server1)
            .set({'authorization':tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(200);
                var object = JSON.parse(res.text);
                assert.equal(id_tracking1_server1,object.id);
                done();
            });
    });
});



//#####################ADDED###########################


describe('get all trackings of all the servers',()=>{
    it('should it obtain all trackings and trackings searched exists',(done)=>{
        chai.request(server) 
            .get('/api/trackings')
            .set({'authorization':tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(200);
                assert.match(res.text,new RegExp(id_tracking1_server1),'regexp matches');
                assert.match(res.text,new RegExp(id_tracking1_server2),'regexp matches');
                done();
            });
    });
});

describe('get all trackings of all the servers',()=>{
    it('should it obtain all trackings and trackings searched not exists',(done)=>{
        chai.request(server) 
            .get('/api/trackings')
            .set({'authorization':tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(200);
                assert.notMatch(res.text,new RegExp(id_tracking1_server1+'q'),'regexp matches');
                assert.notMatch(res.text,new RegExp(id_tracking1_server2+'q'),'regexp matches');
                done();
            });
    });
});


//#####################################################


//%%%%%%%%%%%%%UPDATE TRACKING%%%%%%%%%%%%%%%%%%%%%%%%%%%%
/*
describe('update tracking 1 of server2', () =>{
    it('should fail update tracking 1 of server2 because token not authorizated',(done) =>{
        chai.request(server) 
        .put('/api/trackings/'+id_tracking1_server2)
        .send({'Authorization':token_server1})
        .set({'status':statusTracking.DELIVERY_REALIZED})
        .end(function(err,res){
            expect(res).to.have.status(401);
            done()
        });
    });
});
*/


describe('update tracking 1 of server1', () =>{
    it('should update tracking 1 of server1 to status in process sucessfully',(done) =>{
        chai.request(server) 
        .put('/api/trackings/'+id_tracking1_server1)
        .set({'Authorization':tokenUser})
        .send({'status':statusTracking.DELIVERY_IN_PROCESS})
        .end(function(err,res){
            expect(res).to.have.status(200);
            assert.equal(res.body.status,statusTracking.DELIVERY_IN_PROCESS);
            done()
        });
    });
});


describe('update tracking 1 of server2', () =>{
    it('should update tracking 1 of server2 to status realized sucessfully',(done) =>{
        chai.request(server) 
        .put('/api/trackings/'+id_tracking1_server2)
        .set({'Authorization':tokenUser})
        .send({'status':statusTracking.DELIVERY_REALIZED})
        .end(function(err,res){
            expect(res).to.have.status(200);
            assert.equal(res.body.status,statusTracking.DELIVERY_REALIZED);
            done()
        });
    });
});

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



describe('delete server 1',() =>{
    it('should delete single server with success',(done) =>{
        chai.request(server) 
            .delete('/api/servers/'+server_id_1)
            .set({'Authorization':token_server1})
            .end( function (err,res){
                expect(res).to.have.status(203);
                done();
            });
    });
});

describe('delete server 2',() =>{
    it('should delete single server with success',(done) =>{
        chai.request(server) 
            .delete('/api/servers/'+server_id_2)
            .set({'Authorization':token_server2})
            .end( function (err,res){
                expect(res).to.have.status(203);
                done();
            });
    });
});

//------------------------------------------------------


describe('get single tracking of the server2 by the admin',()=>{
    it('should fail because the trackings of the server2 were deleted',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+ id_tracking1_server2)
            .set({authorization:tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(404);
                var object = JSON.parse(res.text);
                assert.equal(404,object.code);
                done();
            });
    });
});


describe('get single tracking of the server1 by the admin',()=>{
    it('should fail because the trackings of the server1 were deleted',(done)=>{
        chai.request(server) 
            .get('/api/trackings/'+id_tracking1_server1)
            .set({'authorization':tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(404);
                var object = JSON.parse(res.text);
                assert.equal(404,object.code);
                done();
            });
    });
});


//#####################ADDED###########################

describe('get all trackings of all the servers',()=>{
    it('should it obtain all trackings but trackings searched not exists because were deleted',(done)=>{
        chai.request(server) 
            .get('/api/trackings')
            .set({'authorization':tokenUser})
            .end(function(err,res){
                expect(res).to.have.status(200);
                assert.notMatch(res.text,new RegExp(id_tracking1_server1),'regexp matches');
                assert.notMatch(res.text,new RegExp(id_tracking1_server2),'regexp matches');
                done();
            });
    });
});
//#####################ADDED###########################
