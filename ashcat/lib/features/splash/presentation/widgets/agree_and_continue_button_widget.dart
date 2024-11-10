import 'package:flutter/material.dart';

class AgreeAndContinueButtonWidget extends StatelessWidget {
  const AgreeAndContinueButtonWidget({
    super.key, required this.onPressed,
  });

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 50,
      ),
      child: FilledButton(
        style: ButtonStyle(
          padding: WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 61, vertical: 18),
          ),
          shape: WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.all(
                Radius.circular(10),
              ),
            ),
          ),
        ),
        onPressed: onPressed,
        child: Text(
          'AGREE AND CONTINUE',
          style: TextStyle(
              fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Roboto'),
        ),
      ),
    );
  }
}
