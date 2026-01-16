import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'screens/create_record_screen.dart';
import 'screens/distribution_screen.dart';
import 'screens/home_screen.dart';
import 'screens/record_detail_screen.dart';
import 'screens/validate_screen.dart';

class AppRoutes {
  static const home = '/';
  static const createRecord = '/records/create';
  static const recordDetail = '/records/:id';
  static const validate = '/records/validate';
  static const distribution = '/records/distribution';
}

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.createRecord,
        builder: (context, state) => const CreateRecordScreen(),
      ),
      GoRoute(
        path: AppRoutes.recordDetail,
        builder: (context, state) {
          return const RecordDetailScreen();
        },
      ),
      GoRoute(
        path: AppRoutes.validate,
        builder: (context, state) => const ValidateScreen(),
      ),
      GoRoute(
        path: AppRoutes.distribution,
        builder: (context, state) => const DistributionScreen(),
      ),
    ],
  );
});
