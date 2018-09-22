'use strict';

const chai = require('chai');
var chaiHttp = require('chai-http');
const expect = require('chai').expect;
const assert = chai.assert;
const fetch = require('node-fetch');
var token;
var newToken;
var id;
var dataName = "server1100";
var dataCreatedBy = "autor1100";

chai.use(chaiHttp);
const url= "http://shared-server:8080";


describe('get all Servers ',() =>{
    it('should fail because no use token',(done) =>{
        chai.request(url)
            .get('/api/servers')
            .end( function (err,res){
                expect(res).to.have.status(401);
                done();
            });
    });
});


describe('create server',() =>{
    it('should fail because missing arg',(done) =>{
        chai.request(url)
            .post('/api/servers')
            .send({createdBy:"autor1"})
            .end( function (err,res){
                expect(res).to.have.status(400);
                done();
            });
    });
});


describe('create server',() =>{
    it('should get token, register success',(done) =>{
        chai.request(url)
            .post('/api/servers')
            .timeout(10000)
            .send({createdBy:dataCreatedBy, name:dataName})
            .end( function (err,res){
                expect(res).to.have.status(200);
                var object = JSON.parse(res.text);
                token = object.server.token.token;
                id = object.server.server.id;
                done();
            });
    });
});


describe('get all servers with token',() =>{
    it('should get all servers with success',(done) =>{
        chai.request(url)
            .get('/api/servers')
            .set({'Authorization':token})
            .end( function (err,res){
                expect(res).to.have.status(200);
                done();
            });
    });
});



describe('get single server with token',() =>{
    it('should get single server with success',(done) =>{
        chai.request(url)
            .get('/api/servers/'+id)
            .set({'Authorization':token})
            .end( function (err,res){
                expect(res).to.have.status(200);
                var object = JSON.parse(res.text);
                assert.equal(object.server.id,id);
                done();
            });
    });
});

describe('get single server with token',() =>{
    it('should no get single server because id no exists',(done) =>{
        chai.request(url)
            .get('/api/servers/aaaaaaaa-bbbb-cccc-dddd-eeeeffff0002')
            .set({'Authorization':token})
            .end( function (err,res){
                expect(res).to.have.status(404);
                var object = JSON.parse(res.text);
                assert.equal(object.code,404);
                done();
            });
    });
});

describe('get single server with false token',() =>{
    it('should no get single server',(done) =>{
        chai.request(url)
            .get('/api/servers/'+id)
            .set({'Authorization':url})
            .end( function (err,res){
                expect(res).to.have.status(401);
                done();
            });
    });
});


describe('reset token of a server',() =>{
    it('should update the token',(done) =>{
        chai.request(url)
            .post('/api/servers/'+id)
            .end( function (err,res){
                expect(res).to.have.status(201);
                var object = JSON.parse(res.text);
                newToken = object.server.token.token;
                done();
            });
    });
});


describe('get all servers with token canceled by a reset',() =>{
    it('should fail get all servers because token is invalid',(done) =>{
        chai.request(url)
            .get('/api/servers')
            .set({'Authorization':token})
            .end( function (err,res){
                expect(res).to.have.status(401);
                done();
            });
    });
});



describe('delete server',() =>{
    it('should delete single server with success',(done) =>{
        chai.request(url)
            .delete('/api/servers/'+id)
            .set({'Authorization':newToken})
            .end( function (err,res){
                expect(res).to.have.status(203);
                done();
            });
    });
});


describe('get all servers with token canceled by a deleted server',() =>{
    it('should fail get all servers because token is invalid',(done) =>{
        chai.request(url)
            .get('/api/servers')
            .set({'Authorization':newToken})
            .end( function (err,res){
                expect(res).to.have.status(401);
                done();
            });
    });
});