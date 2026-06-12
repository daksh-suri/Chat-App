import auth from "../lib/auth";
import axios from "./axios";


async function signup({ name, email, password }) {
  try {
    const { data: { data } } = await axios({
      method: 'post',
      url: '/api/auth/signup',
      data: {
        name, email, password
      }
    })
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || 'Signup failed. Please try again.';
    alert(message);
    throw error;
  }
}

async function signin({ email, password }) {
  try {
    const { data: { data } } = await axios({
      method: 'post',
      url: '/api/auth/signin',
      data: {
        email, password
      }
    })
    return data;
  } catch (error) {
    const message = error?.response?.data?.message || 'Signin failed. Please try again.';
    alert(message);
    throw error;
  }
}

async function me({ email, password }) {
  try {
    const { data: { data } } = await axios({
      method: "post",
      url: "/api/auth/me",
      headers: {
        Authorization: `Bearer ${auth.token || ""}`,
      },
    });
    return data;
  } catch (error) {
      alert(error?.response?.data?.message);
  }
}

export const authApi = {
  signup,
  signin,
  me,
};
