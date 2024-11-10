import 'package:ashcat/core/utils/theme/theme.dart';
import 'package:ashcat/features/splash/bloc/splash_bloc.dart';
import 'package:ashcat/features/splash/presentation/widgets/agree_and_continue_button_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class Splash extends StatefulWidget {
  const Splash({super.key});

  static const name = '/';
  static void go(BuildContext context) => context.goNamed(name);

  @override
  State<Splash> createState() => _SplashState();
}

class _SplashState extends State<Splash> {
  @override
  Widget build(BuildContext context) {
    return BlocListener<SplashBloc, SplashState>(
      listener: (context, state) {
        if (state is SplashNavigated) {
          context.go('/login');
        }
      },
      child: Scaffold(
        body: SafeArea(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                colors: [
                  Color(0xff19181f),
                  Color(0xff1e1f26),
                ],
                stops: [0.25, 0.75],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )),
              child: Flex(
                direction: Axis.vertical,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/images/splash.png'),
                  Column(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(vertical: 14),
                        child: Column(
                          children: [
                            Text(
                              'AshCat',
                              style: TextStyle(
                                  fontSize: 36,
                                  fontFamily: 'Kenia',
                                  color: themeDataLight.secondaryHeaderColor),
                            ),
                            SizedBox(
                              height: 25,
                            ),
                            Text(
                              'Welcome to AshChat!',
                              style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: 'Roboto',
                                  fontWeight: FontWeight.w700,
                                  color: themeDataLight.secondaryHeaderColor),
                            ),
                            SizedBox(
                              height: 25,
                            ),
                            Text(
                              'A real-time chat app powered by AI to facilitate communication around the world!',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontSize: 16,
                                  fontFamily: 'Kenia',
                                  color: themeDataLight.secondaryHeaderColor),
                            ),
                          ],
                        ),
                      ),
                      AgreeAndContinueButtonWidget(
                        onPressed: () {
                          context.read<SplashBloc>().add(NavigateToNextPage());
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
      ),
    );
  }
}
