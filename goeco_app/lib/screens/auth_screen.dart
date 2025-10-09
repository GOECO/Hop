import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpRequested = false;
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = context.watch<GoecoAppState>();
    return Scaffold(
      appBar: AppBar(title: const Text('GOECO - Đăng nhập OTP')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('Quản lý cư dân thông minh', style: theme.textTheme.headlineSmall),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(labelText: 'Số điện thoại'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Họ và tên'),
                    ),
                    const SizedBox(height: 12),
                    if (_otpRequested)
                      TextField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Mã OTP',
                          helperText: state.lastOtpCode != null
                              ? 'OTP demo: ${state.lastOtpCode}'
                              : 'Kiểm tra tin nhắn của bạn',
                        ),
                      ),
                    if (_error != null) ...[
                      const SizedBox(height: 8),
                      Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
                    ],
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: _isLoading
                          ? null
                          : () async {
                              setState(() {
                                _error = null;
                                _isLoading = true;
                              });
                              try {
                                if (!_otpRequested) {
                                  await state.requestOtp(_phoneController.text);
                                  setState(() {
                                    _otpRequested = true;
                                  });
                                } else {
                                  await state.verifyOtp(
                                    _otpController.text,
                                    _nameController.text.isEmpty
                                        ? 'Cư dân GOECO'
                                        : _nameController.text,
                                  );
                                }
                              } catch (err) {
                                setState(() {
                                  _error = err.toString();
                                });
                              } finally {
                                if (mounted) {
                                  setState(() {
                                    _isLoading = false;
                                  });
                                }
                              }
                            },
                      child: Text(_otpRequested ? 'Xác thực OTP' : 'Gửi mã OTP'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
