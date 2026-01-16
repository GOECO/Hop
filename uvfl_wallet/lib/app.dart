import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'presentation/routes.dart';

class UvflApp extends ConsumerWidget {
  const UvflApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'UVFL Wallet',
      theme: ThemeData(useMaterial3: true),
      routerConfig: router,
    );
  }
}
