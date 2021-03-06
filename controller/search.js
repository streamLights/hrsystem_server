const moment = require('moment');

const clockInCollection = require('../model/work').clockIn;
const deptCollection = require('../model/dept').dept;
const jobCollection = require('../model/position').position;
const employeeInfoCollection = require('../model/employeeInfo').employeeInfo;
const userBaseInfoCollection = require('../model/userBaseInfo').userBaseInfo;
const resumeCollection = require('../model/resume').resume;
const salaryCollection = require('../model/salary').salary;
const workRecordCollection = require('../model/workRecord').workRecord;
const holidayInfoCollection = require('../model/holidayInfo').holidayInfo;
const salaryAllInfoCollection = require('../model/salaryall').salaryAll;

// 查找职工考勤记录
let clockinRecord = async (ctx) => {
    let starttime = ctx.query.starttime,
        endtime = ctx.query.endtime,
        username = ctx.session.user,
        account = { chidao: 0, zaotui: 0, kuanggong: 0 };
    let clockRecord = await clockInCollection.find(
        {
            username,
            date: { $gte: new Date(starttime), $lte: new Date(endtime) }
        }
    );
    for (let item of clockRecord) {
        account['chidao'] += item.chidao;
        account['zaotui'] += item.zaotui;
        account['kuanggong'] += item.kuanggong;
    }
    ctx.body = {
        status: 0,
        content: clockRecord,
        account: account,
        msg: '查询成功'
    }
}


let ifClockIn = async (ctx) => {
    let username = ctx.session.user,
        clockRecord = await clockInCollection.findOne({ username, date: moment().format('YYYY-MM-DD') });
    if (clockRecord) {
        if (clockRecord.starttime && clockRecord.endtime) {
            ctx.body = { input_1: true, input_2: true };
        } else if (!clockRecord.starttime && clockRecord.endtime) {
            ctx.body = { input_1: false, input_2: true };
        } else {
            ctx.body = { input_1: true, input_2: false };
        }
    } else {
        ctx.body = { input_1: false, input_2: false };
    }
}

// 查找个人信息
let employeeInfo = async (ctx) => {
    let username = ctx.session.user;
    let employeeInfo = await employeeInfoCollection.findOne({ _id: username });
    let job_id = employeeInfo.job;
    let dept_id = employeeInfo.dept;
    let job = await jobCollection.findOne({ _id: job_id });
    let dept = await deptCollection.findOne({ _id: dept_id });
    let employeeInfo_c = { "name": "", "sex": "", "nation": "", "idnumber": "", "borndate": "", "marriage": "", "home": "", "phone": "", "email": "", "degree": "", "collage": "", "graduation": "", "dept": "", "job": "", "honor": [] };
    for (var item in employeeInfo_c) {
        employeeInfo_c[item] = employeeInfo[item];
    }
    employeeInfo_c.job = job.position;
    employeeInfo_c.dept = dept.deptname;
    ctx.body = {
        status: 0,
        msg: '个人信息查找成功!',
        content: employeeInfo_c
    }
}

// 查找管理页面顶部Menu信息
let topMenuInfo = async (ctx) => {
    let _id = ctx.session.user;
    let userBaseInfo = await userBaseInfoCollection.findOne({ _id });
    let userMessage = await holidayInfoCollection.find({ approvePeople: _id, ifApprove: false });
    ctx.body = {
        status: 0,
        content: { _id: userBaseInfo._id, name: userBaseInfo.name, hasHeadImg: userBaseInfo.hasHeadImg, message: userMessage.length }
    }
}

// 获取请假审批人信息
let getLeaderInfo = async (ctx) => {
    let user = ctx.session.user;
    let employeeInfo = await employeeInfoCollection.findOne({ _id: user });
    let dept = employeeInfo.dept;
    let leader = await employeeInfoCollection.findOne({ dept: dept, job: 2 });
    let leader_id = leader._id;
    let leaderBaseInfo = await userBaseInfoCollection.findOne({ _id: leader_id });
    ctx.body = {
        status: 0,
        content: leaderBaseInfo
    }
}

// 获取简历列表
let getResume = async (ctx) => {
    let resumeList = await resumeCollection.find();
    let content = [];
    resumeList.map(function (item, index) {
        let resumeBase = {};
        resumeBase.key = index;
        resumeBase.name = item.name;
        resumeBase.sex = item.sex;
        resumeBase.job = item.job;
        resumeBase.collage = item.collage;
        resumeBase.profess = item.profess;
        resumeBase.salary = item.salary;
        content.push(resumeBase);
    });
    ctx.body = {
        status: 0,
        content: content
    }
}

// 获取简历详细情况
let getDetailResume = async (ctx) => {
    let name = ctx.query.name;
    resumeDetailInfo = await resumeCollection.findOne({ name });
    ctx.body = {
        status: 0,
        resumeDetail: resumeDetailInfo
    }
}

// 获取员工工资列表
let getEmployeePayment = async (ctx) => {
    let name = ctx.query.name;
    if (name) {
        let employeePaymentInfo = await salaryCollection.find({
            name: name
        });
        ctx.body = {
            status: 0,
            employeePaymentList: employeePaymentInfo
        }
        return;
    } else {
        ctx.body = {
            status: 1,
            msg: '请输入姓名'
        }
    }
}

// 查询员工账号信息
let getAccountList = async (ctx) => {
    let username = ctx.query.username;
    if (username) {
        let userAccount = await userBaseInfoCollection.findOne({ _id: username });
        if (userAccount) {
            let userId = userAccount._id;
            ctx.body = {
                status: 0, content: [{ name: userAccount.name, _id: userId }]
            }
            return;
        }
        ctx.body = { status: 2, msg: '此账号不存在!' }
        return;
    }
    let userList = await userBaseInfoCollection.find();
    ctx.body = {
        status: 0,
        content: userList
    }
}

// 获取职员信息
let getEmployeeInfoList = async (ctx) => {
    let name = ctx.query.name;
    if (name) {
        console.log(name);
        let employeeInfoList = await employeeInfoCollection.findOne({ name });
        ctx.body = { status: 0, content: employeeInfoList }
        return;
    }
    let employeeInfoList = await employeeInfoCollection.find();
    let content = [];
    employeeInfoList.forEach(function (item, index) {
        let employeeInfoBase = {};
        employeeInfoBase.name = item.name;
        employeeInfoBase.sex = item.sex;
        employeeInfoBase.nation = item.nation;
        employeeInfoBase.idnumber = item.idnumber;
        employeeInfoBase.phone = item.phone;
        content.push(employeeInfoBase);
    });
    ctx.body = { status: 0, content: content }
}

// 获取姓名
let getName = async (ctx) => {
    let name = ctx.query.name;
    let userBaseInfo = await userBaseInfoCollection.find({ name: name });
    ctx.body = { status: 0, content: userBaseInfo };
}


// 获取奖惩信息
let getWorkRecord = async (ctx) => {
    let id = ctx.query.id || ctx.session.user;
    console.log(id);
    if (id) {
        let wordRecord = await workRecordCollection.find({ username: id });
        console.log(wordRecord);
        ctx.body = {
            status: 0,
            content: wordRecord
        }
    }
}

// 获取请假列表
let getHolidayList = async (ctx) => {
    let username = ctx.session.user;
    if (username) {
        let wordRecord = await holidayInfoCollection.find({ phone: username }).sort({ '_id': -1 });
        ctx.body = {
            status: 0,
            content: wordRecord
        }
    }
}

// 获取待审批列表
let approveHoliday = async (ctx) => {
    let username = ctx.session.user;
    if (username) {
        let wordRecord = await holidayInfoCollection.find({ approvePeople: username, ifApprove: false }).sort({ '_id': -1 });
        ctx.body = {
            status: 0,
            content: wordRecord
        }
    }
}

// 查询考勤信息
const getSalary = async (ctx) => {
    let starttime = ctx.query.starttime,
        endtime = ctx.query.endtime,
        username = ctx.session.user;
    let salaryAll = await salaryAllInfoCollection.find(
        { username }
    );
    ctx.body = {
        status: 0,
        content: salaryAll,
        msg: '查询成功'
    }
}

module.exports = {
    clockinRecord, ifClockIn, employeeInfo, topMenuInfo, getLeaderInfo, getResume, getDetailResume,
    getEmployeePayment, getAccountList, getEmployeeInfoList, getName, getWorkRecord, getHolidayList, approveHoliday, getSalary
}