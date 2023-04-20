const axios = require("axios");
const faker = require("faker");
const querystring = require("querystring");

function gen_rand_str(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const characters_length = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters_length));
    }
    return result;
}

async function get_token() {
    const url = "https://jxtw.h5yunban.cn/jxtw-qndxx/cgi-bin/login/we-chat/callback?callback=https%3A%2F%2Fjxtw.h5yunban.cn%2Fjxtw-qndxx%2FsignUp.php&scope=snsapi_userinfo&appid=wxe9a08de52d2723ba&openid={}&{}&headimg=https://thirdwx.qlogo.cn/mmopen/vi_32/I7gbHHRj903RFibtlB4jrz1T1jTJ3eCWsCJwibQIT5hLRXO25ib9AHeqUjsPGmwhtiaBuzhQfhEZ6ibBdGbyZuM72LA/132&time={}&source=common&t={}";
    try {
        faker.locale = "zh_CN";
        const openid = gen_rand_str(28);
        const nickname = querystring.stringify({ j: faker.name() });
        const new_url = url
            .replace("{}", openid)
            .replace("{}", nickname)
            .replace("{}", Date.now().toString())
            .replace("{}", Date.now().toString());
        const res = await axios.get(new_url);
        const token_regex = /<script>localStorage.setItem\('accessToken', '(.*?)'\)/;
        const token_match = res.data.match(token_regex);
        if (token_match) return token_match[1];
    } 
    catch (error) {
        console.error("获取token出错");
        return null;
    }
}

async function one_post(accessToken, course_id, nid, class_name, user_name) {
    const post_url = "https://jxtw.h5yunban.cn/jxtw-qndxx/cgi-bin/user-api/course/join?accessToken=";
    const post_data = {
        course: course_id,
        nid: nid,
        subOrg: class_name,
        cardNo: user_name,
    };
    try {
        const res = await axios.post(post_url + accessToken, post_data);
        if (res.status === 200) {
            console.log(res.data);
            return true;
        } 
        else return false;
    } 
    catch (error) {
        console.error("发送请求出错！");
        return false;
    }
}
async function get_current_course_id(token) {
    if (!token) return null;
    const current_url = "https://jxtw.h5yunban.cn/jxtw-qndxx/cgi-bin/common-api/course/current?accessToken=";
    const new_current_url = current_url + token;
    try {
        const res = await axios.get(new_current_url);
        if (res.status === 200) {
            const res_json = res.data;
            if (res_json.status !== 200) {
                return null;
            }
            const result = res_json.result;
            const course_id = result.id;
            const title = result.title;
            return [course_id, title];
        }
    } 
    catch (error) {
        console.error("获取课程id出错");
        return null;
    }
}
async function main() {
    faker.locale = "zh_CN";
    const token = await get_token();
    if (!token) return;
    const course_res = await get_current_course_id(token);
    if (!course_res) {
        console.error("获取course_id出错");
        return;
    }
    const course_id = course_res[0];
    const course_title = course_res[1];
    const nid = "7400269"; // 团委id 自行修改
    const class_name = "华中师范大学计算机学院22级本科生"; // 班级
    const user_name = "苏芃子旸"; // 你的姓名
    // 发起一次请求 ，可以自行改造成批量
    const res = await one_post(token, course_id, nid, class_name, user_name);
    if (res) console.log("成功");
}
main();