import 'package:flutter/material.dart';

import 'presentation/screens/home_screen.dart';

class UvflApp extends StatelessWidget {
  const UvflApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UVFL Wallet',
      theme: ThemeData.light(useMaterial3: true),
      darkTheme: ThemeData.dark(useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}
