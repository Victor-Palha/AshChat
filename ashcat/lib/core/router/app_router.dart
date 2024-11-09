import 'package:ashcat/core/router/errors/not_found_page.dart';
import 'package:ashcat/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ashcat/features/auth/presentation/views/confirmRegister/confirm_register_page.dart';
import 'package:ashcat/features/home/home_page.dart';
import 'package:ashcat/features/auth/presentation/views/login/login_page.dart';
import 'package:ashcat/features/auth/presentation/views/register/register_page.dart';
import 'package:ashcat/features/splash/bloc/splash_bloc.dart';
import 'package:ashcat/features/splash/presentation/views/splash.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class AppRouter {
  final GoRouter router;

  AppRouter(AuthBloc authBloc)
      : router = GoRouter(
          errorBuilder: (context, state) => const NotFoundPage(),
          routes: [
            GoRoute(
                path: '/',
                builder: (context, state) => BlocProvider(
                      create: (context) => SplashBloc(),
                      child: const Splash(),
                    )),
            GoRoute(
              path: '/login',
              builder: (context, state) => const LoginPage(),
            ),
            GoRoute(
              path: '/register',
              builder: (context, state) => const RegisterPage(),
            ),
            GoRoute(
              path: '/confirm-register',
              builder: (context, state) => const ConfirmRegisterPage(),
            ),
            GoRoute(
              path: '/home',
              builder: (context, state) => const HomePage(),
              redirect: (context, state) =>
                  authBloc.state is Authenticated ? null : '/login',
            ),
          ],
          redirect: (context, state) {
            final isAuthenticated = authBloc.state is Authenticated;

            if (state.matchedLocation == '/' && isAuthenticated) return '/home';

            if (state.matchedLocation == '/home' && !isAuthenticated) {
              return '/login';
            }
            return null;
          },
        );

  GoRouter getRouter() => router;
}
