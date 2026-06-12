import auth from "../lib/auth";
import axios from "./axios";

function unwrapAuthResponse(data) {
  const payload = data?.data ?? data;

  if (!payload?.user || !payload?.token) {
    throw new Error('Invalid auth response from server.');
  }

  return payload;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

async function signup({ name, email, password }) {
  try {
    const { data } = await axios({
      method: 'post',
      url: '/api/auth/signup',
      data: {
        name, email, password
      }
    });
    return unwrapAuthResponse(data);
  } catch (error) {
    const message = getErrorMessage(error, 'Signup failed. Please try again.');
    alert(message);
    throw new Error(message);
  }
}

async function signin({ email, password }) {
  try {
    const { data } = await axios({
      method: 'post',
      url: '/api/auth/signin',
      data: {
        email, password
      }
    });
    return unwrapAuthResponse(data);
  } catch (error) {
    const message = getErrorMessage(error, 'Signin failed. Please try again.');
    alert(message);
    throw new Error(message);
  }
}

async function me() {
  try {
    const { data } = await axios({
      method: "get",
      url: "/api/auth/me",
      headers: {
        Authorization: `Bearer ${auth.token || ""}`,
      },
    });
    return data?.user ?? data;
  } catch (error) {
    const message = getErrorMessage(error, 'Unable to load your session.');
    alert(message);
    throw new Error(message);
  }
}

export const authApi = {
  signup,
  signin,
  me,
};
