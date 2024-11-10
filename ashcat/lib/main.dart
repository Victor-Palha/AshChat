import 'package:ashcat/core/router/app_router.dart';
import 'package:ashcat/core/utils/theme/theme.dart';
import 'package:ashcat/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  final authBloc = AuthBloc();
  final appRouter = AppRouter(authBloc);
  runApp(
    AshCatApp(
      appRouter: appRouter,
      authBloc: authBloc,
    ),
  );
}

class AshCatApp extends StatelessWidget {
  const AshCatApp({super.key, required this.appRouter, required this.authBloc});

  final AppRouter appRouter;
  final AuthBloc authBloc;

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>.value(value: authBloc),
      ],
      child: MaterialApp.router(
        routerConfig: appRouter.getRouter(),
        theme: themeDataLight,
        darkTheme: themeDataDark,
      )
    );
  }
}

