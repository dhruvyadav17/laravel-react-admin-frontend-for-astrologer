<?php
return [
  'refresh_token'        => true,   // FIX BUG-1: was false — token refresh never worked
  'email_verification'   => false,
  'password_reset'       => true,
  'audit_logs'           => true,
  'login_rate_limit'     => true,
  'password_expiry'      => true,
];
