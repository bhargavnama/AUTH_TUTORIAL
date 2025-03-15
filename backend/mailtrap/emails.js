import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipent = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipent,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Error in sending verification code : ", error);
    throw new Error(`Error sending verification email : ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipent = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipent,
      template_uuid: "2be56415-6a58-4653-b4d2-27a01caeb8cc",
      template_variables: {
        company_info_name: "Auth Company",
        name: name,
      },
    });

    console.log(`Welcome email sent successfully`, response);
  } catch (error) {
    console.log(`Error sending welcome email : ${error}`);
    throw new Error(`Error sending welcome email : ${error}`);
  }
};

export const sendResetPasswordEmail = async (email, resetURL) => {
  const recipent = [{email}];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipent,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
      category: "Password Reset",
    });

    console.log('Password reset request sent successfully', response);
  } catch (error) {
    console.log('Error in send password reset request : ', error);
  }
}

export const sendResetEmailSuccess = async (email) => {
  const recipent = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipent,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log('Password Reset Success mail sent successfully: ', response);
  } catch (error) {
    console.log('Error in send password reset success mail: ', error);
    throw new Error(`Error in send password reset success mail: ${error}`);
  }
}